import { OTPAuthProvider, useOTPAuth } from "@thingco/auth-flow-react";
import React from "react";
import ReactDOM from "react-dom";

const authServiceFunctions = {
	async checkSession() {
		console.error(
			"ERROR: This is only a dummy session check function, please provide a concrete implementation to the machine."
		);
		return await "I'm a dummy session token, I ain't going to do much!";
	},

	async validateUserIdentifier(userIdentifier: string) {
		console.error(
			"ERROR: This is only a dummy userIdentifier validation function, please provide a concrete implementation to the machine."
		);
		return await "Yeah sure, that user identifier is fine, have a this string instead of a token";
	},

	async validateOtp(user: string, code: string) {
		console.error(
			"ERROR: This is only a dummy OTP validation function, please provide a concrete implementation to the machine."
		);
		return await null;
	},

	async signOut() {
		console.error(
			"ERROR: This is only a dummy sign out function, please provide a concrete implementation to the machine."
		);
		return await null;
	},
};

const Auth = () => {
	const { state } = useOTPAuth();
	return (
		<p>
			<pre>{JSON.stringify(state, null, 4)}</pre>
		</p>
	);
};

const App = () => (
	<OTPAuthProvider
		authServiceFunctions={authServiceFunctions}
		allowedRetries={3}
	>
		<h1>HELLO</h1>
		<Auth />
	</OTPAuthProvider>
);

ReactDOM.render(<App />, document.getElementById("root"));
