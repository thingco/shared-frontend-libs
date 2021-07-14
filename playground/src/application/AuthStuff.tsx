import { Auth as AWSAuth } from "@aws-amplify/auth";
import {
	AuthProvider,
	DeviceSecurityService,
	DeviceSecurityType,
	OTPService,
	useAuthState,
	useAuthUpdate,
	UsernamePasswordService,
} from "@thingco/auth-flows";
import React from "react";

import {
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

function createCognitoOTPService(): OTPService<CognitoUser> {
	if (!AWSAuth.configure()) {
		throw new Error("AWS Auth is not configured!");
	}

	return {
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
}

function createCognitoUsernamePasswordService(): UsernamePasswordService<CognitoUser> {
	if (!AWSAuth.configure()) {
		throw new Error("AWS Auth is not configured!");
	}

	return {
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
}

const PINKEY = "@pintest";
const SECURITYTYPEKEY = "@securitytypetest";

const deviceSecurityApi: DeviceSecurityService = {
	async getDeviceSecurityType() {
		const securityType = localStorage.getItem(SECURITYTYPEKEY);
		if (securityType) {
			return securityType as DeviceSecurityType;
		} else {
			throw new Error();
		}
	},
	async setDeviceSecurityType(deviceSecurityType: DeviceSecurityType) {
		localStorage.setItem(SECURITYTYPEKEY, deviceSecurityType);
		return;
	},
	async changeExistingPin(currentPin: string, newPin: string) {
		const storedPin = localStorage.getItem(PINKEY);
		if (currentPin !== storedPin) {
			throw new Error();
		} else {
			localStorage.setItem(PINKEY, newPin);
			return;
		}
	},
	async checkPinIsSet() {
		const storedPin = localStorage.getItem(PINKEY);
		if (storedPin) {
			return;
		} else {
			throw new Error();
		}
	},
	async checkPinIsValid(currentPin: string) {
		const storedPin = localStorage.getItem("pin");
		if (currentPin !== storedPin) {
			throw new Error();
		} else {
			return;
		}
	},
	async clearExistingPin() {
		localStorage.removeItem("pin");
		return;
	},
	async setNewPin(newPin: string) {
		localStorage.setItem("pin", newPin);
		return;
	},
};

const AuthTest = () => {
	const { inAuthorisedState } = useAuthState();
	const { logOut } = useAuthUpdate();
	// const [localPin, setLocalPin] = React.useState("");
	// const [localPinConfirmation, setLocalPinConfirmation] = React.useState("");

	if (!inAuthorisedState) {
		return (
			<section style={{ backgroundColor: "white", padding: "1rem" }}>
				<h1>Login Stuff</h1>
				<OtpLoginFlowInit />
				<OtpUsernameInput />
				<OtpPasswordInput />
				<UsernamePasswordLoginFlowInit />
				<UsernamePasswordInput />
				<PinFlowInit />
				<CurrentPinInput />
				<NewPinInput />
				<ChangeCurrentPinInput />
			</section>
		);
	} else {
		return (
			<section style={{ backgroundColor: "white", padding: "1rem" }}>
				<h1>Logged in stuff!</h1>
				<button onClick={logOut}>Log out</button>
			</section>
		);
	}
};

export const AuthStuff = (): JSX.Element => (
	<AuthProvider
		inWebDebugMode={true}
		loginFlowType="OTP"
		deviceSecurityType="PIN"
		otpServiceApi={createCognitoOTPService()}
		usernamePasswordServiceApi={createCognitoUsernamePasswordService()}
		deviceSecurityInterface={deviceSecurityApi}
	>
		<AuthTest />
	</AuthProvider>
);
