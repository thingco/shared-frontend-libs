import { DoneInvokeEvent, StateNode } from "xstate";

import { AuthEventType, AuthServices, AuthState } from "./enums";

export interface AuthContext<UserType> {
	isLoading: boolean;
	otpRetriesAllowed: number;
	otpRetriesRemaining: number;
	useOtpAuth: boolean;
	user: UserType | null;
	username: string;
	password: string;
}

export interface AuthSchema {
	states: {
		[AuthState.CheckingSession]: StateNode;
		[AuthState.UsernameInput]: UsernameInputSchema;
		[AuthState.OTPInput]: OTPInputSchema;
		[AuthState.UsernamePasswordInput]: UsernamePasswordInputSchema;
		[AuthState.Authorised]: StateNode;
		[AuthState.LoggingOut]: StateNode;
	};
}

export interface UsernameInputSchema {
	states: {
		[AuthState.AwaitingUsernameInput]: StateNode;
		[AuthState.ValidatingUsernameInput]: StateNode;
		[AuthState.InvalidUsername]: StateNode;
		[AuthState.PasswordRetriesExceeded]: StateNode;
		[AuthState.ValidUsername]: StateNode;
	};
}

export interface OTPInputSchema {
	states: {
		[AuthState.AwaitingOtpInput]: StateNode;
		[AuthState.ValidatingOtpInput]: StateNode;
		[AuthState.InvalidOtp]: StateNode;
		[AuthState.ValidOtp]: StateNode;
	};
}

export interface UsernamePasswordInputSchema {
	states: {
		[AuthState.AwaitingUsernamePasswordInput]: StateNode;
		[AuthState.ValidatingUsernamePasswordInput]: StateNode;
		[AuthState.InvalidUsernamePasswordInput]: StateNode;
		[AuthState.ValidUsernamePasswordInput]: StateNode;
	};
}

export type LogOutEvent = { type: AuthEventType.LOG_OUT };
export type SubmitUsernameEvent = { type: AuthEventType.SUBMIT_USERNAME; data: string };
export type SubmitOTPEvent = { type: AuthEventType.SUBMIT_OTP; data: string };
export type SubmitUsernameAndPasswordEvent = {
	type: AuthEventType.SUBMIT_USERNAME_AND_PASSWORD;
	data: { username: string; password: string };
};

export type AuthEvent<UserType> =
	| LogOutEvent
	| SubmitUsernameEvent
	| SubmitOTPEvent
	| SubmitUsernameAndPasswordEvent
	| DoneInvokeEvent<{ data: UserType }>;

export type AuthServiceFunctions<UserType, SessionType> = {
	[AuthServices.currentSession]: () => Promise<SessionType>;
	[AuthServices.validateUsernameAndPassword]: (
		username: string,
		password: string
	) => Promise<UserType>;
	[AuthServices.validateUsername]: (username: string) => Promise<UserType>;
	[AuthServices.validateOtp]: (user: UserType, password: string) => Promise<UserType>;
	[AuthServices.signOut]: () => Promise<null>;
};
