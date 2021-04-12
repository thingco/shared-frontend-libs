import { useMachine } from "@xstate/react";
import React from "react";

import { CognitoOTPAuthenticator } from "./cognito-otp";

import type { State } from "xstate";
import type {
	CognitoOTPAuthenticatorContext,
	CognitoOTPAuthenticatorEvent,
	CognitoOTPAuthenticatorSchema,
	CognitoOTPAuthFunctions,
} from "./cognito-otp";

export interface OTPAuthContextValue {
	state: State<
		CognitoOTPAuthenticatorContext,
		CognitoOTPAuthenticatorEvent,
		CognitoOTPAuthenticatorSchema
	>;
	send: (e: CognitoOTPAuthenticatorEvent) => void;
}

const OTPAuthContext = React.createContext<OTPAuthContextValue | null>(null);

export interface OTPAuthProviderProps<SessionType, UserType> {
	children: React.ReactNode;
	authServiceFunctions: CognitoOTPAuthFunctions<SessionType, UserType>;
}

export function CognitoOTPAuthProvider<SessionType, UserType>({
	children,
	authServiceFunctions,
}: OTPAuthProviderProps<SessionType, UserType>): JSX.Element {
	const [state, send] = useMachine(CognitoOTPAuthenticator, {
		services: {
			checkSession: () => authServiceFunctions.checkSession(),
			validateUserIdentifier: (ctx) =>
				authServiceFunctions.validateUserIdentifier(ctx.userIdentifier),
			validateOtp: (ctx) => authServiceFunctions.validateOtp(ctx.userIdentifierResponse, ctx.otp),
			signOut: () => authServiceFunctions.signOut(),
		},
	});

	return <OTPAuthContext.Provider value={{ send, state }}>{children}</OTPAuthContext.Provider>;
}

/**
 *
 */
export function useCognitoOTPAuth(): OTPAuthContextValue & {
	isLoading: boolean;
	isAuthorised: boolean;
} {
	const ctx = React.useContext(OTPAuthContext);

	if (ctx === null) {
		throw new Error(
			"OTP auth context has not been initialised properly: value is null. Please pass in correct init values -- the provider expects a set of authorisation methods and these seem to be missing."
		);
	} else if (ctx === undefined) {
		throw new Error(
			"OTP auth values may only be consumed from below an OTPAuthProvider in the component tree. Have you added the provider at the top level of the app?"
		);
	}

	const { state, send } = ctx;

	const isAuthorised = state.matches("authorised");
	const isLoading = /^validating/.test(state.value as string) || state.matches("init");

	return {
		state,
		isLoading,
		isAuthorised,
		send,
	};
}
