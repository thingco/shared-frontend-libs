import { Auth as AWSAuth } from "@aws-amplify/auth";
import { AuthProvider, createAuthSystem, ServiceError, useAuthState } from "@thingco/auth-flows";
import { inspect } from "@xstate/inspect";
import * as React from "react";

import {
	Authorised,
	ChangeCurrentPinInput,
	CurrentPinInput,
	NewPinInput,
	OtpLoginFlowInit,
	OtpPasswordInput,
	OtpUsernameInput,
	PinFlowInit,
	UsernamePasswordInput,
	UsernamePasswordLoginFlowInit,
} from "./AuthStages";

import type { CognitoUser } from "@aws-amplify/auth";
import type {
	DeviceSecurityService,
	DeviceSecurityType,
	DeviceSecurityTypeKey,
	DeviceSecurityPinStorageKey,
	OTPService,
	UsernamePasswordService,
} from "@thingco/auth-flows";

// NOTE: COMMENT THIS OUT IF YOU DON'T WANT WEB DEBUGGING OF XSTATE.
// NOTE: THIS WILL ATTEMPT TO OPEN A NEW TAB, SO YOU'LL NEED TO SAY "YES" TO
//		 	 POPUPS IN YOUR BROWSER WHEN IT ASKS.
// NOTE: THIS ISN'T LOCAL, SO IF YOU AREN'T CONNECTED TO INTERNET, THIS WILL JUST OPEN A
// 			 TAB THAT HANGS.
inspect({
	url: "https://statecharts.io/inspect",
	iframe: false,
});

const cognitoOTPService: OTPService<CognitoUser> = {
	async checkForExtantSession() {
		return await AWSAuth.currentSession();
	},

	async requestOtp(username: string) {
		return await AWSAuth.signIn(username);
	},

	async validateOtp(user: CognitoUser, password: string) {
		await AWSAuth.sendCustomChallengeAnswer(user, password);
		return await AWSAuth.currentAuthenticatedUser();
	},

	async logOut() {
		return await AWSAuth.signOut();
	},
};

const cognitoUsernamePasswordService: UsernamePasswordService<CognitoUser> = {
	async checkForExtantSession() {
		return await AWSAuth.currentSession();
	},

	async validateUsernameAndPassword(username: string, password: string) {
		await AWSAuth.signIn(username, password);
		return await AWSAuth.currentAuthenticatedUser();
	},

	async logOut() {
		return await AWSAuth.signOut();
	},
};

const SECURITY_TYPE_KEY: DeviceSecurityTypeKey = "@auth_device_security_type";
const PIN_KEY: DeviceSecurityPinStorageKey = "@auth_device_security_pin";

const localSecurityService: DeviceSecurityService = {
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
	async checkForBiometricSupport() {
		throw new ServiceError("Currently incompatible with web, native only -- TODO split this out");
	},
	async checkBiometricAuthorisation() {
		throw new ServiceError("Currently incompatible with web, native only -- TODO split this out");
	},
	async changeCurrentPin(currentPin: string, newPin: string) {
		await this.checkPinIsValid(currentPin);
		await this.setNewPin(newPin);
	},
	async checkPinIsSet() {
		const currentStoredPin = localStorage.getItem(PIN_KEY);
		if (!currentStoredPin) {
			throw new ServiceError("No pin set");
		} else {
			return await null;
		}
	},
	async checkPinIsValid(currentPin: string) {
		const currentStoredPin = localStorage.getItem(PIN_KEY);
		if (currentStoredPin !== currentPin) {
			throw new ServiceError("PIN doesn't validate");
		} else {
			return await null;
		}
	},
	async clearCurrentPin() {
		localStorage.removeItem(PIN_KEY);
		if (!localStorage.getItem(PIN_KEY)) {
			return null;
		} else {
			throw new ServiceError("Error, pin not cleared");
		}
	},
	async setNewPin(newPin: string) {
		localStorage.setItem(PIN_KEY, newPin);
		if (localStorage.getItem(PIN_KEY)) {
			return null;
		} else {
			throw new ServiceError("Error, pin not saved");
		}
	},
};

const AuthTest = () => {
	const {
		// currentState,
		inAuthorisedState,
		inOtpLoginFlowInitState,
		inOtpUsernameInputState,
		inOtpPasswordInputState,
		inUsernamePasswordLoginFlowInitState,
		inUsernamePasswordInputState,
		inPinFlowInitState,
		inCurrentPinInputState,
		inNewPinInputState,
		inChangeCurrentPinInputState,
		// inBiometricFlowInitStage,
		// inBiometricNotSupportedStage,
		isLoading,
	} = useAuthState();

	return (
		<section style={{ backgroundColor: "white", padding: "1rem" }}>
			{inOtpLoginFlowInitState ? (
				<OtpLoginFlowInit isLoading={isLoading} />
			) : inOtpUsernameInputState ? (
				<OtpUsernameInput isLoading={isLoading} />
			) : inOtpPasswordInputState ? (
				<OtpPasswordInput isLoading={isLoading} />
			) : inUsernamePasswordLoginFlowInitState ? (
				<UsernamePasswordLoginFlowInit isLoading={isLoading} />
			) : inUsernamePasswordInputState ? (
				<UsernamePasswordInput isLoading={isLoading} />
			) : inPinFlowInitState ? (
				<PinFlowInit isLoading={isLoading} />
			) : inCurrentPinInputState ? (
				<CurrentPinInput isLoading={isLoading} />
			) : inNewPinInputState ? (
				<NewPinInput isLoading={isLoading} />
			) : inChangeCurrentPinInputState ? (
				<ChangeCurrentPinInput isLoading={isLoading} />
			) : inAuthorisedState ? (
				<Authorised />
			) : null}
		</section>
	);
};

const authSystem = createAuthSystem({
	loginFlowType: "OTP",
	deviceSecurityType: "PIN",
	otpServiceApi: cognitoOTPService,
	usernamePasswordServiceApi: cognitoUsernamePasswordService,
	deviceSecurityInterface: localSecurityService,
});

export const AuthStuff = (): JSX.Element => (
	<AuthProvider inWebDebugMode={true} authSystem={authSystem}>
		<AuthTest />
	</AuthProvider>
);
