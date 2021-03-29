import { Auth as AWSAuth } from "@aws-amplify/auth";
import { CognitoOTPAuthProvider, useCognitoOTPAuth } from "@thingco/auth-flows";
import React from "react";
import ReactDOM from "react-dom";

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

	async checkSession() {
		return await AWSAuth.currentSession();
	},

	async validateUserIdentifier(username: string) {
		return await AWSAuth.signIn(username);
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

const AuthTest = () => {
	const { state, send, isLoading } = useCognitoOTPAuth();
	const [email, setEmail] = React.useState("");
	const [otp, setOtp] = React.useState("");

	return (
		<div>
			<p>Current state: {state.value}</p>
			<p>Current context: {JSON.stringify(state.context, null, 2)}</p>
			<section>
				<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
				<button onClick={() => send({ type: "SUBMIT_USER_IDENTIFIER", payload: email })}>
					Submit email
				</button>
			</section>
			<section>
				<input type="otp" value={otp} onChange={(e) => setOtp(e.target.value)} />
				<button onClick={() => send({ type: "SUBMIT_OTP", payload: otp })}>Submit otp</button>
			</section>
			<section>
				<button onClick={() => send({ type: "REQUEST_LOG_OUT", payload: null })}>Log out</button>
			</section>
		</div>
	);
};

const App = () => (
	<CognitoOTPAuthProvider
		authServiceFunctions={{
			checkSession: Auth.checkSession,
			validateUserIdentifier: Auth.validateUserIdentifier,
			validateOtp: Auth.validateOtp,
			signOut: Auth.signOut,
		}}
	>
		<AuthTest />
	</CognitoOTPAuthProvider>
);

ReactDOM.render(<App />, document.getElementById("root"));
