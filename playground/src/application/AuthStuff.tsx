import { Auth as AWSAuth } from "@aws-amplify/auth";
import {
	AuthProvider,
	OTPService,
	useAuthState,
	useAuthUpdate,
	UsernamePasswordService,
} from "@thingco/auth-flows";
import React from "react";

import {
	OtpLoginFlowInit,
	OtpPasswordInput,
	OtpUsernameInput,
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

// const PINKEY = "@pintest";

// const PinInterface = {
// 	async hasPinSet() {
// 		console.log("@thingco/auth-flows: checking if user has a PIN set");
// 		const storedPin = localStorage.getItem(PINKEY);
// 		return await !!storedPin;
// 	},
// 	async validatePin(pin: string) {
// 		console.log("@thingco/auth-flows: validating an existing PIN");
// 		const storedPin = localStorage.getItem(PINKEY);
// 		if (pin === storedPin) {
// 			return await null;
// 		} else {
// 			throw new Error("entered pin does not match stored pin");
// 		}
// 	},
// 	async setNewPin(pin: string) {
// 		console.log("@thingco/auth-flows: setting a new PIN");
// 		localStorage.setItem(PINKEY, pin);
// 		return await null;
// 	},
// 	async clearPin() {
// 		console.log("@thingco/auth-flows: clearing existing PIN");
// 		localStorage.removeItem(PINKEY);
// 		return await null;
// 	},
// };

const AuthTest = () => {
	const { inAuthorisedState, loginFlowType } = useAuthState();
	const { logOut, changeLoginFlowType } = useAuthUpdate();
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

				{/* <section style={{ opacity: _machineState.matches("pinInput") ? 1 : 0.25 }}>
					<input
						type="text"
						value={localPin}
						onChange={(e) => setLocalPin(e.target.value)}
						disabled={!_machineState.matches("pinInput")}
					/>
					<button onClick={() => submitPin(localPin)} disabled={isLoading}>
						Submit PIN
					</button>
					<button onClick={goBack}>Go back</button>
				</section>
				<section style={{ opacity: _machineState.matches("newPinInput") ? 1 : 0.25 }}>
					<input
						type="text"
						value={localPin}
						onChange={(e) => setLocalPin(e.target.value)}
						disabled={!_machineState.matches("newPinInput")}
					/>
					<input
						type="pin"
						value={localPinConfirmation}
						onChange={(e) => setLocalPinConfirmation(e.target.value)}
						disabled={!_machineState.matches("newPinInput")}
					/>
					{localPin !== localPinConfirmation && <p>PIN confirmation doesn&#39;t match!</p>}
					<button
						onClick={() => submitPin(localPin)}
						disabled={localPin !== localPinConfirmation || isLoading}
					>
						Set New PIN
					</button>
					<button onClick={skipSettingPin}>Skip setting PIN</button>
					<button onClick={goBack}>Go back</button>
				</section>
				<section style={{ opacity: _machineState.matches("resetPinInput") ? 1 : 0.25 }}>
					<input
						type="text"
						value={localPin}
						onChange={(e) => setLocalPin(e.target.value)}
						disabled={!_machineState.matches("resetPinInput")}
					/>
					<button onClick={() => submitPin(localPin)} disabled={isLoading}>
						Submit Current PIN before setting new PIN
					</button>
					<button onClick={goBack}>Go back</button>
				</section> */}
			</section>
		);
	} else {
		return (
			<section style={{ backgroundColor: "white", padding: "1rem" }}>
				<h1>Logged in stuff!</h1>
				<button onClick={logOut}>Log out</button>
				<button
					onClick={() => changeLoginFlowType(loginFlowType === "OTP" ? "USERNAME_PASSWORD" : "OTP")}
				>
					Change login flow type to {loginFlowType === "OTP" ? "USERNAME_PASSWORD" : "OTP"}
				</button>
				{/* <button onClick={isUsingPinSecurity ? turnOffPinSecurity : turnOnPinSecurity}>
					Turn {isUsingPinSecurity ? "off" : "on"} PIN security
				</button>
				{isUsingPinSecurity && userHasPinSet && (
					<button onClick={changeCurrentPin}>Change current PIN</button>
				)}
				{isUsingPinSecurity && !userHasPinSet && (
					<button onClick={turnOnPinSecurity}>Set a PIN</button>
				)} */}
			</section>
		);
	}
};

export const AuthStuff = (): JSX.Element => (
	<AuthProvider
		inWebDebugMode={true}
		loginFlowType="OTP"
		otpServiceApi={createCognitoOTPService()}
		usernamePasswordServiceApi={createCognitoUsernamePasswordService()}
	>
		<AuthTest />
	</AuthProvider>
);
