import React from "react";

import {
	CognitoOTPAuthenticatorEvent,
	CognitoOTPAuthFunctions,
	CognitoOTPAuthProvider,
	useCognitoOTPAuth,
} from "..";

const EmailInput = ({
	inputValue,
	setInputValue,
}: {
	inputValue: string;
	setInputValue: (v: string) => void;
}): JSX.Element => (
	<input
		type="email"
		value={inputValue}
		onChange={(e) => setInputValue(e.target.value)}
		data-testid="email-input"
	/>
);

const OTPInput = ({
	inputValue,
	setInputValue,
}: {
	inputValue: string;
	setInputValue: (v: string) => void;
}): JSX.Element => (
	<input
		type="text"
		value={inputValue}
		onChange={(e) => setInputValue(e.target.value)}
		data-testid="otp-input"
	/>
);

const Authorised = ({ send }: { send: (e: CognitoOTPAuthenticatorEvent) => void }): JSX.Element => (
	<div data-testid="authorised-screen">
		<p>Authorised!</p>
		<button
			onClick={() => send({ type: "REQUEST_LOG_OUT", payload: null })}
			data-testid="logout-button"
		>
			Log out
		</button>
	</div>
);

const LoginForm = ({
	isEmailInputStage,
	isLoading,
	isOtpInputStage,
	send,
}: {
	isEmailInputStage: boolean;
	isLoading: boolean;
	isOtpInputStage: boolean;
	send: (e: CognitoOTPAuthenticatorEvent) => void;
}): JSX.Element => {
	const [emailInput, setEmailInput] = React.useState("");
	const [otpInput, setOtpInput] = React.useState("");

	const submitHandler = (e: React.FormEvent) => {
		e.preventDefault();
		if (isEmailInputStage) send({ type: "SUBMIT_USER_IDENTIFIER", payload: emailInput });
		if (isOtpInputStage) send({ type: "SUBMIT_OTP", payload: otpInput });
		return;
	};

	return (
		<form onSubmit={submitHandler} data-testid="login-form">
			{isEmailInputStage && <EmailInput inputValue={emailInput} setInputValue={setEmailInput} />}
			{isOtpInputStage && <OTPInput inputValue={otpInput} setInputValue={setOtpInput} />}
			<button type="submit" data-testid="submit-button" disabled={isLoading}>
				{isLoading ? "Loading..." : "Submit"}
			</button>
		</form>
	);
};

const AppEntry = (): JSX.Element => {
	const { isLoading, isAuthorised, send, state } = useCognitoOTPAuth();

	return (
		<div>
			{isAuthorised ? (
				<Authorised send={send} />
			) : (
				<LoginForm
					isEmailInputStage={
						state.matches("init") ||
						state.matches("awaitingUserIdentifier") ||
						state.matches("validatingUserIdentifier")
					}
					isOtpInputStage={state.matches("awaitingOtp") || state.matches("validatingOtp")}
					isLoading={isLoading}
					send={send}
				/>
			)}
		</div>
	);
};

/**
 * @param root0
 * @param root0.authServiceFunctions
 */
export function CognitoOTPTestApp({
	authServiceFunctions,
}: {
	authServiceFunctions: CognitoOTPAuthFunctions<string, string>;
}): JSX.Element {
	return (
		<CognitoOTPAuthProvider authServiceFunctions={authServiceFunctions}>
			<AppEntry />
		</CognitoOTPAuthProvider>
	);
}
