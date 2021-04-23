import { useMachine } from "@xstate/react";
import React from "react";

import {
	AuthContext,
	AuthenticatorConfig,
	AuthEvent,
	AuthSchema,
	createAuthenticator,
} from "./enhanced-cognito-otp";

import type { State } from "xstate";

export interface AuthenticatorContextValue<UserType> {
	state: State<AuthContext<UserType>, AuthEvent<UserType>, AuthSchema>;
	send: (e: AuthEvent<UserType>) => void;
}

const ReactAuthenticatorContext = React.createContext<AuthenticatorContextValue<any> | null>(null);

export function AuthProvider<UserType, SessionType>({
	children,
	...props
}: { children: React.ReactNode } & AuthenticatorConfig<UserType, SessionType>): JSX.Element {
	const authenticator = createAuthenticator<UserType, SessionType>({
		authFunctions: props.authFunctions,
		useOtpAuth: props.useOtpAuth,
		allowedOtpAttempts: props.allowedOtpAttempts,
	});
	const [state, send] = useMachine<AuthContext<UserType>, AuthEvent<UserType>>(authenticator);

	return (
		<ReactAuthenticatorContext.Provider value={{ state, send }}>
			{children}
		</ReactAuthenticatorContext.Provider>
	);
}

export function useAuth() {
	const ctx = React.useContext(ReactAuthenticatorContext);

	if (ctx === null) {
		throw new Error(
			"Auth context has not been initialised properly: value is null. Please pass in correct init values -- the provider expects a set of authorisation methods and these seem to be missing."
		);
	} else if (ctx === undefined) {
		throw new Error(
			"Auth values may only be consumed from below an AuthProvider in the component tree. Have you added the provider at the top level of the app?"
		);
	}
	// Current state + an aliased version of the `match` function:
	const currentState = ctx.state.value;
	const currentStateIs = ctx.state.matches;
	// If one of the services is currently making a network request:
	const isLoading = ctx.state.context.isLoading;
	// The User object (will be `null` if there isn't currently a user signed in/signing in):
	const currentUser = ctx.state.context.user;
	// `send` function aliases:
	const submitUsername = (username: string) =>
		ctx.state.children.usernameInput.send({ type: "SUBMIT_USERNAME", data: username });
	const submitOtp = (otp: string) =>
		ctx.state.children.otpInput.send({ type: "SUBMIT_OTP", data: otp });
	const submitUsernameAndPassword = (username: string, password: string) =>
		ctx.state.children.usernamePasswordInput.send({
			type: "SUBMIT_USERNAME_AND_PASSWORD",
			data: { username, password },
		});

	return {
		currentState,
		currentStateIs,
		isLoading,
		currentUser,
		submitUsername,
		submitOtp,
		submitUsernameAndPassword,
	};
}
