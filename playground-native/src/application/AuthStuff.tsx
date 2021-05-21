import { Auth as AWSAuth } from "@aws-amplify/auth";
import { AuthProvider, useAuth } from "@thingco/auth-flows";
import React from "react";

/**
 * Amplify uses a singleton pattern to configure it -- you import the `Auth` module then run
 * `Auth.configure(awsConfigsHere)` somewhere at the top of the app.
 *
 * That then configures Auth so you can use the methods (`Auth.signIn` or whatever).
 *
 * However that is now implicitly an instance of Amplify's `Auth` class. Which is now implicitly a
 * global variable referring to a specific instance of the `Auth` class. Except there's no global variable
 * anywhere, it's just implicit when you import `{ Auth } from "@aws-amplify/auth"` in other files, as
 * long as the imports happen further down the line from the original configure call.
 *
 * If you try to reference the functions, which is what I'm doing with the auth (I pass in a reference
 * to the `currentSession`, `signIn`, `sendCustomChallengeAnswer` and `signOut` methods to the provider
 * so they can be used by the machine), instead of referencing the configured global instance, it
 * references an entirely different instance, one which isn't configured.
 *
 * So nowt works, because when the machine ties to run the functions, they in turn run against a version
 * of the Auth class that has no configuration, and everything blows up.
 *
 * Solution is to wrap the functions required in another object, and that object is the instance used.
 * Then it all works as long as this object is always used (if you then attempt to use another AWS auth
 * method, it's going to fail because it'll be a different instance).
 *
 * tl/dr global variables are bad, singletons are not great, Amplify is a bit of a hack job.
 */
const Auth = {
	configure(awsConfig?: Record<string, unknown>) {
		return AWSAuth.configure(awsConfig);
	},

	async checkSession() {
		return await AWSAuth.currentSession();
	},

	async validateUserIdentifier(username: string) {
		return await AWSAuth.signIn(username);
	},

	async validateUsernamePassword(username: string, password: string) {
		return await AWSAuth.signIn(username, password);
	},

	async validateOtp(user: unknown, code: string) {
		return await AWSAuth.sendCustomChallengeAnswer(user, code);
	},

	async signOut() {
		return await AWSAuth.signOut();
	},
};

Auth.configure({
	region: "eu-west-1",
	userPoolId: "eu-west-1_FrRYZGJO6",
	userPoolWebClientId: "47jbuurvrfafht3em4dvv0qa4d",
	authenticationFlowType: "CUSTOM_AUTH",
});

const PINKEY = "@pintest";

const PinInterface = {
	async hasPinSet() {
		console.log("@thingco/auth-flows: checking if user has a PIN set");
		const storedPin = localStorage.getItem(PINKEY);
		return await !!storedPin;
	},
	async validatePin(pin: string) {
		console.log("@thingco/auth-flows: validating an existing PIN");
		const storedPin = localStorage.getItem(PINKEY);
		if (pin === storedPin) {
			return await null;
		} else {
			throw new Error("entered pin does not match stored pin");
		}
	},
	async setNewPin(pin: string) {
		console.log("@thingco/auth-flows: setting a new PIN");
		localStorage.setItem(PINKEY, pin);
		return await null;
	},
	async clearPin() {
		console.log("@thingco/auth-flows: clearing existing PIN");
		localStorage.removeItem(PINKEY);
		return await null;
	},
};

const AuthTest = () => {
	const {
		_machineState,
		isAuthorised,
		isLoading,
		isUsingPinSecurity,
		currentState,
		userHasPinSet,
		changeCurrentPin,
		goBack,
		skipSettingPin,
		submitOtpUsername,
		submitOtp,
		submitPin,
		signOut,
		turnOffPinSecurity,
		turnOnPinSecurity,
	} = useAuth();
	const [localEmail, setLocalEmail] = React.useState("");
	const [localOtp, setLocalOtp] = React.useState("");
	const [localPin, setLocalPin] = React.useState("");
	const [localPinConfirmation, setLocalPinConfirmation] = React.useState("");

	if (!isAuthorised) {
		return (
			<section style={{ backgroundColor: "white", padding: "1rem" }}>
				<h1>Login Stuff</h1>
				<details>
					<summary>State machine state:</summary>
					<p>Current state: {currentState}</p>
					<p>Machine state: {JSON.stringify(_machineState, null, 2)}</p>
				</details>
				<section style={{ opacity: _machineState.matches("otpUsernameInput") ? 1 : 0.25 }}>
					<input
						type="email"
						value={localEmail}
						onChange={(e) => setLocalEmail(e.target.value)}
						disabled={!_machineState.matches("otpUsernameInput")}
					/>
					<button onClick={() => submitOtpUsername(localEmail)} disabled={isLoading}>
						Submit email
					</button>
				</section>
				<section style={{ opacity: _machineState.matches("otpInput") ? 1 : 0.25 }}>
					<input
						type="text"
						value={localOtp}
						onChange={(e) => setLocalOtp(e.target.value)}
						disabled={!_machineState.matches("otpInput")}
					/>
					<button onClick={() => submitOtp(localOtp)} disabled={isLoading}>
						Submit otp
					</button>
					<button onClick={goBack}>Go back</button>
				</section>
				<section style={{ opacity: _machineState.matches("pinInput") ? 1 : 0.25 }}>
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
				</section>
			</section>
		);
	} else {
		return (
			<section style={{ backgroundColor: "white", padding: "1rem" }}>
				<h1>Logged in stuff!</h1>
				<details>
					<summary>State machine state:</summary>
					<p>Current state: {currentState}</p>
					<p>Machine state: {JSON.stringify(_machineState, null, 2)}</p>
				</details>
				<button onClick={signOut}>Log out</button>
				<button onClick={isUsingPinSecurity ? turnOffPinSecurity : turnOnPinSecurity}>
					Turn {isUsingPinSecurity ? "off" : "on"} PIN security
				</button>
				{isUsingPinSecurity && userHasPinSet && (
					<button onClick={changeCurrentPin}>Change current PIN</button>
				)}
				{isUsingPinSecurity && !userHasPinSet && (
					<button onClick={turnOnPinSecurity}>Set a PIN</button>
				)}
			</section>
		);
	}
};

export const AuthStuff = (): JSX.Element => (
	<AuthProvider
		authServiceFunctions={{
			checkSession: Auth.checkSession,
			validateOtpUsername: Auth.validateUserIdentifier,
			validateOtp: Auth.validateOtp,
			validateUsernamePassword: Auth.validateUsernamePassword,
			signOut: Auth.signOut,
		}}
		pinServiceFunctions={{
			hasPinSet: PinInterface.hasPinSet,
			validatePin: PinInterface.validatePin,
			setNewPin: PinInterface.setNewPin,
			clearPin: PinInterface.clearPin,
		}}
		useOtpAuth={true}
		usePinSecurity={true}
		allowedOtpRetries={3}
	>
		<AuthTest />
	</AuthProvider>
);
