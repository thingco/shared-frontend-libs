import { Auth as AWSAuth } from "@aws-amplify/auth";
import { AuthProvider, createAuthSystem, ServiceError, useAuthState } from "@thingco/auth-flows";
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
