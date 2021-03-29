import React from "react";

import {
	CognitoOTPAuthenticatorEvent,
	CognitoOTPAuthFunctions,
	CognitoOTPAuthProvider,
	useCognitoOTPAuth,
} from "..";

const Loader = (): JSX.Element => <p data-testid="loader">Loading...</p>;

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
	send,
}: {
	isEmailInputStage: boolean;
	send: (e: CognitoOTPAuthenticatorEvent) => void;
}): JSX.Element => {
	const [emailInput, setEmailInput] = React.useState("");
	const [otpInput, setOtpInput] = React.useState("");
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				send(
					isEmailInputStage
						? { type: "SUBMIT_USER_IDENTIFIER", payload: emailInput }
						: { type: "SUBMIT_OTP", payload: otpInput }
				);
			}}
			data-testid="login-form"
		>
			{isEmailInputStage ? (
				<EmailInput inputValue={emailInput} setInputValue={setEmailInput} />
			) : (
				<OTPInput inputValue={otpInput} setInputValue={setOtpInput} />
			)}
			<button type="submit" data-testid="submit-button">
				Submit
			</button>
		</form>
	);
};

const AppEntry = (): JSX.Element => {
	const { isLoading, isAuthorised, send, state } = useCognitoOTPAuth();

	return (
		<div>
			{isLoading ? (
				<Loader />
			) : isAuthorised ? (
				<Authorised send={send} />
			) : (
				<LoginForm
					isEmailInputStage={(state.value as string) === "awaitingUserIdentifier"}
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
