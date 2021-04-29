import { useMachine } from "@xstate/react";
import React from "react";

import {
	AuthContext,
	AuthenticatorConfig,
	AuthEvent,
	AuthEventType,
	AuthSchema,
	AuthState,
	createAuthenticator,
} from "./enhanced-cognito-otp";

import type { State, StateValue } from "xstate";

export interface AuthenticatorContextValue<UserType> {
	state: State<AuthContext<UserType>, AuthEvent<UserType>, AuthSchema>;
	send: (e: AuthEvent<UserType>) => void;
}

const ReactAuthenticatorContext = React.createContext<AuthenticatorContextValue<any> | null>(null);

export function AuthProvider<UserType, SessionType>({
	children,
	authFunctions,
	useOtpAuth = true,
	usePINSecurity = true,
	allowedOtpAttempts = 3,
}: { children: React.ReactNode } & AuthenticatorConfig<UserType, SessionType>): JSX.Element {
	const authenticator = createAuthenticator<UserType, SessionType>({
		authFunctions,
		useOtpAuth,
		usePINSecurity,
		allowedOtpAttempts,
	});
	const [state, send] = useMachine<AuthContext<UserType>, AuthEvent<UserType>>(authenticator);

	return (
		<ReactAuthenticatorContext.Provider value={{ state, send }}>
			{children}
		</ReactAuthenticatorContext.Provider>
	);
}

export interface AuthProviderState<UserType> {
	currentState: StateValue;
	currentUser: UserType | null;
	isUsernameInputStage: boolean;
	isOtpInputStage: boolean;
	isUsernamePasswordInputStage: boolean;
	isPINInputStage: boolean;
	isAuthorised: boolean;
	isLoading: boolean;
	otpRetriesExceeded: boolean;
	hasPinSet: boolean;
	revokePIN: () => void;
	submitUsername: (username: string) => void;
	submitOtp: (password: string) => void;
	submitUsernameAndPassword: (username: string, password: string) => void;
	submitPIN: (pin: string) => void;
	submitPINConfirmation: (pinConfirmation: string) => void;
	skipPINSecurity: () => void;
	signOut: () => void;
	goBack: () => void;
}

export function useAuth<UserType>(): AuthProviderState<UserType> {
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

	const currentState = ctx.state.value;
	// Current stage:
	const isAuthorised = ctx.state.matches(AuthState.Authorised);
	const isUsernameInputStage =
		ctx.state.matches(AuthState.UsernameInput) || AuthState.UsernameInput in ctx.state;
	const isOtpInputStage = ctx.state.matches(AuthState.OTPInput) || AuthState.OTPInput in ctx.state;
	const isUsernamePasswordInputStage =
		ctx.state.matches(AuthState.UsernamePasswordInput) ||
		AuthState.UsernamePasswordInput in ctx.state;
	const isPINInputStage = ctx.state.matches(AuthState.PINInput) || AuthState.PINInput in ctx.state;
	// If one of the services is currently making a network request:
	const isLoading = ctx.state.context.isLoading;
	// If the user has exceeded the designated amount of OTP retries:
	const otpRetriesExceeded = ctx.state.matches({
		[AuthState.UsernameInput]: AuthState.PasswordRetriesExceeded,
	});
	// If the user currently has a PIN set up:
	const hasPinSet = ctx.state.context.pinSecurityActive;
	// The User object (will be `null` if there isn't currently a user signed in/signing in):
	const currentUser = ctx.state.context.user;
	// `send` function aliases:
	const revokePIN = () => ctx.send({ type: AuthEventType.REVOKE_PIN });
	const submitUsername = (username: string) =>
		ctx.send({ type: AuthEventType.SUBMIT_USERNAME, username });
	const submitOtp = (otp: string) => ctx.send({ type: AuthEventType.SUBMIT_OTP, password: otp });
	const submitUsernameAndPassword = (username: string, password: string) =>
		ctx.send({
			type: AuthEventType.SUBMIT_USERNAME_AND_PASSWORD,
			username,
			password,
		});
	const submitPIN = (pin: string) => ctx.send({ type: AuthEventType.SUBMIT_PIN, pin });
	const submitPINConfirmation = (pinConfirmation: string) =>
		ctx.send({ type: AuthEventType.SUBMIT_PIN_CONFIRMATION, pinConfirmation });
	const skipPINSecurity = () => ctx.send({ type: AuthEventType.SKIP_PIN });
	const signOut = () => ctx.send({ type: AuthEventType.LOG_OUT });
	const goBack = () => ctx.send({ type: AuthEventType.GO_BACK });

	return {
		currentState,
		currentUser,
		isAuthorised,
		isUsernameInputStage,
		isOtpInputStage,
		isUsernamePasswordInputStage,
		isPINInputStage,
		isLoading,
		otpRetriesExceeded,
		hasPinSet,
		revokePIN,
		submitUsername,
		submitOtp,
		submitUsernameAndPassword,
		submitPIN,
		submitPINConfirmation,
		skipPINSecurity,
		signOut,
		goBack,
	};
}
