# @thingco/auth-flow-react

## Overview

XState-powered auth flow providers for React.

The auth system is exposed via a provider (`<AuthenticationProvider>`), which accepts serveral interfaces for accessing security APIs. Once that is in place, two hooks are available:

- `useAuthState`, which returns an object that reflects which state you are in -- for example `authorised`, or `awaitingOtpPasswordInput` -- via a set of boolean flags -- `isInAuthorisedState`, `isInAwaitingOtpPasswordInputState` (**TODO** these flags are deliberately verbose and are not strictly necessary as XState provides a `match` function to check state). These states should, in the app, reflect screens or components.
- `useAuthUpdate`, which provides a set of methods that, when executed, will in turn execute the logic required to move to another state -- for example `submitPassword("somepassword")`.

## Prerequisites

- [xstate](https://xstate.js.org/)
- [@xstate/react](https://xstate.js.org/docs/packages/xstate-react/)
- [react/react-dom](https://github.com/facebook/react)
- the SDK/library for whichever authentication provider is being used (_ie_ Amplify's "Auth" package).

## Installation

If not already installed, then:

```
yarn add react react-dom
```

Then the library + the required peer dependencies:

```
yarn add xstate @xstate/react @thingco/auth-flows
```

## Quick Setup (native)

Imports:

```ts
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Auth } from "@aws-amplify/auth";
import { myAwsAuthConfig } from "wherever/it/is";
import { AuthenticationProvider } from "@thingco/auth-flows";

import type { CognitoUser } from "@aws-amplify/auth";
import type {
	OTPService,
	UsernamePasswordService,
	ServiceError,
	DeviceSecurityService,
	DeviceSecurityType,
} from "@thingco/auth-flows";
```

Configure auth:

```ts
Auth.configure(myAwsAuthConfig);
```

Set up the interfaces for OTP or username/password flow and device security [as described below](#authorisation-interfaces).

```ts
// EITHER OTP:
const myOtpServiceApi = { ...methods };
// OR username/password:
const myUsernamePasswordServiceApi = { ...methods };

// And device security:
const myDeviceSecurityServiceApi = { ...methods };
```

Then add the provider. **This should be the top-level provider**.

```tsx
export const MyAppEntryPoint = ({ children }: MyAppEntryPointProps) => (
	<AuthenticationProvider
		deviceSecurityType="NONE" // or "PIN" or "BIOMETRIC"
		loginFlowType="OTP" // or "USERNAME_PASSWORD"
		otpServiceApi={myOtpServiceApi}
		usernamePasswordApi={myUsernamePasswordServiceApi}
		deviceSecurityApi={myDeviceSecurityServiceApi}
	>
		{children}
	</AuthenticationProvider>
);
```

Now, within app components, can use the `useAuthState` and `useAuthUpdate` hooks which, respectively, provide primitive values describing the current state of the auth system and provide update methods to modify that.

## Setup

To use the library, _some_ of the methods provided by

1. the API for the authorisation library used, and
2. the API for the device-level security method/s used

will need to be wrapped into interfaces to allow the auth system to interact with them.

The core idea behind using these interfaces is to provide a consistent API that can be swapped in or out (important for testing). Every single method **must** be async and either resolve promise, or reject/throw.

> **NOTE** that even for APIs that match these requirements and whose methods are all async and reject on failure, you may want to manually handle failure in the interface: `@thingco/auth-flows` provides a `ServiceError` class which wraps the standard `Error` class and will likely be enhanced in future (**TODO**).

### Authorisation interfaces

In our case, authorisation is provided by AWS Cognito, and that in turn via the Amplify `Auth` module. So at entry point of app:

```js
import { Auth } from "@aws-amplify/auth";
import { myAwsAuthConfig } from "wherever/it/is";

Auth.configure(myAwsAuthConfig);
```

This will produce the service object that is used to interact with the AWS Cognito API, and all `Auth.` methods should now function within the app based on the config values.

So now, need to provide **at least** one interface for OTP or username/password login flow. Both _can_ be defined, but at the minute a user cannot switch between the two dynamically, so only one is necessary.

> **REVIEW** add ability to switch login flow within the app.

#### OTP flow

The interface for OTP:

```ts
interface OTPService<User> {
	checkForExtantSession(sessionCheckBehaviour?: SessionCheckBehaviour): Promise<unknown>;

	requestOtp(username: string): Promise<User>;

	validateOtp(user: User, password: string, triesRemaining?: number): Promise<User>;

	logOut(): Promise<unknown>;
}
```

Where the generic type parameter `User` will be the `CognitoUser` type.

So as an example implementation:

```ts
import { Auth } from "@aws-amplify/auth";

import type { CognitoUser } from "@aws-amplify/auth";
import type { OTPService } from "@thingco/auth-flows";

// Assuming "Auth" has been configured at this point:
export const CognitoOTPService: OTPService<CognitoUser> = {
	async checkForExtantSession() {
		return await Auth.currentSession();
	},
	async requestOtp(username: string) {
		return await Auth.signIn(username);
	}
	async validateOtp(user: User, password: string) {
		await Auth.sendCustomChallengeAnswer(user, password);
		// NOTE that on final stage, it is *required* to run a session check
		// function again: this stores the tokens in the device storage. If
		// this isn't done, the user needs to go through entire flow every time
		// tries to get back into the app.
		return await Auth.currentAuthenticatedUser();
	},
	async logOut() {
		return await Auth.signOut();
	}
}
```

#### Username/password flow

This is very similar to the OTP flow in termas of structure. The interface:

```ts
export interface UsernamePasswordService<User> {
	checkForExtantSession(sessionCheckBehaviour?: SessionCheckBehaviour): Promise<unknown>;

	validateUsernameAndPassword(username: string, password: string): Promise<User>;

	logOut(): Promise<unknown>;
}
```

And again, where the generic type parameter `User` will be the `CognitoUser` type. So implementation:

```ts
import { Auth } from "@aws-amplify/auth";

import type { CognitoUser } from "@aws-amplify/auth";
import type { UsernamePasswordService } from "@thingco/auth-flows";

const CognitoUsernamePasswordService: UsernamePasswordService<CognitoUser> = {
	async checkForExtantSession() {
		return await Auth.currentSession();
	},
	async validateUsernameAndPassword(username: string, password: string) {
		await Auth.signIn(username);
		// NOTE that on final stage, it is *required* to run a session check
		// function again: this stores the tokens in the device storage. If
		// this isn't done, the user needs to go through entire flow every time
		// tries to get back into the app.
		return await Auth.currentAuthenticatedUser();
	},
	async logOut() {
		return await Auth.signOut();
	},
};
```

### Device security interface

Device storage + ntive APIs [if used] enable device-level security and device-level security preferences (PIN, biometric). As such, this only really applies to native (and to tests).

The interface for device security:

```ts
export interface DeviceSecurityService {
	getDeviceSecurityType: () => Promise<DeviceSecurityType>;
	setDeviceSecurityType: (deviceSecurityType: DeviceSecurityType) => Promise<unknown>;

	changeCurrentPin: (currentPin: string, newPin: string) => Promise<unknown>;
	checkForBiometricSupport: () => Promise<unknown>;
	checkBiometricAuthorisation: () => Promise<unknown>;
	checkPinIsSet: () => Promise<unknown>;
	checkPinIsValid: (currentPin: string) => Promise<unknown>;
	clearCurrentPin: () => Promise<unknown>;
	setNewPin: (newPin: string) => Promise<unknown>;
}
```

> **TODO** changeCurrentPin doesn't quite work: there are two ways it can fail. There may be a currently-stored pin, and `currentPin` may not validate when checked against it. That's the primary case. But there also may _not_ be a currently-stored pin. There should be, but if there isn't then something has gone wrong in terms of flow: need to handle this better. It should probably not use this function and instead: validate current pin. If passed, set new pin. But then figure if need two new states for this, or whether can reuse existing states.

#### Web setup

For web -- not useful for prod, but very useful for building out test applications for manually checking functionality -- use `localStorage`.

> Note that for _tests_, can do the same, but use either an object or a closure to store the values instead of `localStorage`.

```ts
import { ServiceError } from "@thingco/auth-flows";

import type { DeviceSecurityService, DeviceSecurityType } from "@thingco/auth-flows";

const SECURITY_TYPE_KEY: DeviceSecurityTypeKey = "@auth_device_security_type";
const PIN_KEY: DeviceSecurityPinStorageKey = "@auth_device_security_pin";

export const WebLocalSecurityService: DeviceSecurityService = {
	async getDeviceSecurityType() {
		const securityType = window.localStorage.getItem(SECURITY_TYPE_KEY);
		if (!securityType) {
			throw new ServiceError("No device security type found in storage");
		} else {
			return await (securityType as DeviceSecurityType);
		}
	},
	async setDeviceSecurityType(deviceSecurityType: DeviceSecurityType) {
		window.localStorage.setItem(SECURITY_TYPE_KEY, deviceSecurityType);
		return await null;
	},
	async changeCurrentPin(currentPin: string, newPin: string) {
		const currentStoredPin = window.localStorage.getItem(PIN_KEY);
		if (!currentStoredPin || currentStoredPin !== currentPin) {
			throw new ServiceError(
				"No pin found in storage OR the doesn't validate -- TODO fix this bit of logic"
			);
		} else {
			return await window.localStorage.setItem(PIN_KEY, newPin);
		}
	},
	async checkForBiometricSupport() {
		throw new ServiceError("Currently incompatible with web, native only -- TODO split this out");
	},
	async checkBiometricAuthorisation() {
		throw new ServiceError("Currently incompatible with web, native only -- TODO split this out");
	},
	async checkPinIsSet() {
		const currentStoredPin = window.localStorage.getItem(PIN_KEY);
		if (!currentStoredPin) {
			throw new ServiceError("No pin set");
		} else {
			return await null;
		}
	},
	async checkPinIsValid(currentPin: string) {
		const currentStoredPin = window.localStorage.getItem(PIN_KEY);
		if (currentStoredPin !== currentPin) {
			throw new ServiceError("PIN doesn't validate");
		} else {
			return await null;
		}
	},
	async clearCurrentPin() {
		window.localStorage.removeItem(PIN_KEY);
		return await null;
	},
	async setNewPin(newPin: string) {
		window.localStorage.setItem(PIN_KEY, newPin);
		return await null;
	},
};
```

#### Native setup

For Expo apps, use the APIs available. Install first:

```
yarn run expo install expo-local-authentication expo-secure-store
```

> **TODO** need to check whether secure store is actually available on the device (`SecureStore.isAvailableAsync` is the relevant method).

> **TODO** need to first check biometric is available then check biometric is enrolled so that different error messages can be displayed easily.

Then:

```ts
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

import { ServiceError } from "@thingco/auth-flows";

import type { DeviceSecurityService, DeviceSecurityType } from "@thingco/auth-flows";

const SECURITY_TYPE_KEY: DeviceSecurityTypeKey = "@auth_device_security_type";
const PIN_KEY: DeviceSecurityPinStorageKey = "@auth_device_security_pin";

export const NativeDeviceSecurityService: DeviceSecurityService = {
	async getDeviceSecurityType() {
		const securityType = await SecureStore.getItemAsync(SECURITY_TYPE_KEY);
		if (!securityType) {
			throw new ServiceError("No device security type found in storage");
		} else {
			return await (securityType as DeviceSecurityType);
		}
	},
	async setDeviceSecurityType(deviceSecurityType: DeviceSecurityType) {
		// This will reject if the item cannot be stored
		return await SecureStore.setItemAsync(SECURITY_TYPE_KEY, deviceSecurityType);
	},
	async changeCurrentPin(currentPin: string, newPin: string) {
		const currentStoredPin = await SecureStore.getItemAsync(PIN_KEY);
		if (!currentStoredPin || currentStoredPin !== currentPin) {
			throw new ServiceError(
				"No pin found in storage OR the doesn't validate -- TODO fix this bit of logic"
			);
		} else {
			// This will reject if the item cannot be stored
			return await SecureStore.setItemAsync(PIN_KEY, newPin);
		}
	},
	async checkForBiometricSupport() {
		const hasBiometricHardware = await LocalAuthentication.hasHardwareAsync();
		const biometricIsEnrolled = await LocalAuthentication.isEnrolledAsync();
		if (hasBiometricHardware && biometricIsInstalled) {
			return await null;
		} else {
			throw new ServiceError(
				"Biometric is either not available or not set up -- TODO split this logic"
			);
		}
	},
	async checkBiometricAuthorisation() {
		try {
			const { success } = await LocalAuthentication.authenticateAsync();
			if (succcess) {
				return await null;
			} else {
				throw new ServiceError("Auth failed");
			}
		} catch (err) {
			throw new ServiceError(err.message);
		}
	},
	async checkPinIsSet() {
		const currentStoredPin = await SecureStore.getItemAsync(PIN_KEY);
		if (!currentStoredPin) {
			throw new ServiceError("No pin found in storage");
		} else {
			return await null;
		}
	},
	async checkPinIsValid(currentPin: string) {
		const currentStoredPin = await SecureStore.getItemAsync(PIN_KEY);
		if (currentStoredPin !== currentPin) {
			throw new ServiceError("Pin does not validate");
		} else {
			return await null;
		}
	},
	async clearCurrentPin() {
		// This will reject if the item cannot be deleted
		return await SecureStore.deleteItemAsync(PIN_KEY);
	},
	async setNewPin(newPin: string) {
		// This will reject if the item cannot be stored
		return await SecureStore.setItemAsync(PIN_KEY, newPin);
	},
};
```
