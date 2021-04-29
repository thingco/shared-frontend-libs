import { Auth as AWSAuth } from "@aws-amplify/auth";
import { AuthProvider, useAuth } from "@thingco/auth-flows";
import { ThemeProvider } from "@thingco/react-component-library";
import React from "react";

import { CoordinateIndexProvider, Speedgraph } from "./GraphStuff";

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
	configure(awsConfig?: Record<string, any>) {
		return AWSAuth.configure(awsConfig);
	},

	async currentSession() {
		return await AWSAuth.currentSession();
	},

	async validateUsername(username: string) {
		await console.log(username);
		return await AWSAuth.signIn(username);
	},

	async validateUsernameAndPassword(username: string, password: string) {
		return await AWSAuth.signIn(username, password);
	},

	async validateOtp(user: any, code: string) {
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

class PINSecurity {
	_pin = "";

	async hasPinSet() {
		if (this._pin) {
			return await null;
		} else {
			throw new Error("No PIN currently set");
		}
	}

	async validatePin(pin: string) {
		if (pin === this._pin) {
			return await null;
		} else {
			throw new Error("Incorrect PIN entered.");
		}
	}

	async setPin(pin: string) {
		this._pin = pin;
		return await null;
	}

	async revokePin() {
		this._pin = "";
		return await null;
	}
}

const PIN = new PINSecurity();

const AuthTest = () => {
	const {
		currentState,
		isAuthorised,
		isUsernameInputStage,
		isOtpInputStage,
		isPINInputStage,
		isLoading,
		hasPinSet,
		revokePIN,
		submitUsername,
		submitOtp,
		submitPIN,
		submitPINConfirmation,
		signOut,
		goBack,
	} = useAuth();
	const [email, setEmail] = React.useState("");
	const [otp, setOtp] = React.useState("");
	const [pin, setPin] = React.useState("");
	const [pinConfirmation, setPinConfirmation] = React.useState("");

	if (!isAuthorised) {
		return (
			<div>
				<h1>Login Stuff</h1>
				<details>
					<summary>State machine state:</summary>
					<p>Current state value: {JSON.stringify(currentState, null, 2)}</p>
				</details>
				<hr />
				<br />
				<p>Are we currently making a network request? {isLoading ? "YES!" : "NO!"}</p>
				<br />
				<section>
					{isUsernameInputStage && <p>It&#39;s enter username time!</p>}
					<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
					<button onClick={() => submitUsername(email)} disabled={!isUsernameInputStage}>
						Submit email
					</button>
				</section>
				<section>
					{isOtpInputStage && <p>It&#39;s enter password time!</p>}
					<input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
					<button onClick={() => submitOtp(otp)} disabled={!isOtpInputStage}>
						Submit otp
					</button>
					<button onClick={goBack} disabled={!isOtpInputStage}>
						Back to username input
					</button>
				</section>
				<section>
					{isPINInputStage && <p>It&#39;s enter PIN time!</p>}
					{hasPinSet ? (
						<>
							<input type="text" value={pin} onChange={(e) => setPin(e.target.value)} />
							<button onClick={() => submitPIN(pin)} disabled={!isPINInputStage}>
								Submit PIN
							</button>
						</>
					) : (
						<>
							<input type="text" value={pin} onChange={(e) => setPin(e.target.value)} />
							<button onClick={() => submitPIN(pin)} disabled={!isPINInputStage}>
								Submit PIN
							</button>
							<input
								type="text"
								value={pinConfirmation}
								onChange={(e) => setPinConfirmation(e.target.value)}
							/>
							<button
								onClick={() => submitPINConfirmation(pinConfirmation)}
								disabled={!isPINInputStage}
							>
								Submit PIN Confirmation
							</button>
						</>
					)}

					<button onClick={goBack} disabled={!isOtpInputStage}>
						Back to username input
					</button>
				</section>
			</div>
		);
	} else {
		return (
			<div
				style={{
					backgroundColor: "#bdc3c7",
					minHeight: "100vh",
					display: "grid",
					gridTemplateColumns: "100%",
					gridTemplateRows: "min-content auto",
					padding: "1rem",
					gap: "1rem",
				}}
			>
				<header style={{ backgroundColor: "white", padding: "1rem" }}>
					<h1>Logged in stuff!</h1>
					<button onClick={signOut}>Log out</button>
					<button onClick={revokePIN}>Revoke PIN</button>
				</header>

				<section style={{ backgroundColor: "white", padding: "1rem" }}>
					<CoordinateIndexProvider>
						<Speedgraph />
					</CoordinateIndexProvider>
				</section>
			</div>
		);
	}
};

export const App = (): JSX.Element => (
	<ThemeProvider theme={{}}>
		<AuthProvider
			authFunctions={{
				currentSession: Auth.currentSession,
				validateUsernameAndPassword: Auth.validateUsernameAndPassword,
				validateUsername: Auth.validateUsername,
				validateOtp: Auth.validateOtp,
				signOut: Auth.signOut,
				checkHasPINSet: PIN.hasPinSet,
				validatePIN: PIN.validatePin,
				setNewPIN: PIN.setPin,
				revokePIN: PIN.revokePin,
			}}
		>
			<AuthTest />
		</AuthProvider>
	</ThemeProvider>
);
