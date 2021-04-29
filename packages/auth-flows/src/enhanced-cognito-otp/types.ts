import { DoneInvokeEvent, StateNode } from "xstate";

import { AuthEventType, AuthServices, AuthState } from "./enums";

export interface AuthContext<UserType> {
	isLoading: boolean;
	otpRetriesAllowed: number;
	otpRetriesRemaining: number;
	useOtpAuth: boolean;
	usePinSecurity: boolean;
	pinSecurityActive: boolean;
	pinRetriesAllowed: number;
	pinRetriesRemaining: number;
	user: UserType | null;
	username: string;
	password: string;
	pin: string;
}

export interface AuthSchema {
	states: {
		[AuthState.CheckingSession]: StateNode;
		[AuthState.UsernameInput]: UsernameInputSchema;
		[AuthState.OTPInput]: OTPInputSchema;
		[AuthState.UsernamePasswordInput]: UsernamePasswordInputSchema;
		[AuthState.PINInput]: PINInputSchema;
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
	};
}

export interface OTPInputSchema {
	states: {
		[AuthState.AwaitingOtpInput]: StateNode;
		[AuthState.ValidatingOtpInput]: StateNode;
		[AuthState.InvalidOtp]: StateNode;
	};
}

export interface PINInputSchema {
	states: {
		[AuthState.PINInputInit]: StateNode;
		[AuthState.PINRevocationInit]: StateNode;
		[AuthState.AwaitingPINInput]: StateNode;
		[AuthState.AwaitingNewPINInput]: StateNode;
		[AuthState.AwaitingNewPINConfirmationInput]: StateNode;
		[AuthState.SettingNewPIN]: StateNode;
		[AuthState.ValidatingPINInput]: StateNode;
		[AuthState.InvalidPIN]: StateNode;
	};
}

export interface UsernamePasswordInputSchema {
	states: {
		[AuthState.AwaitingUsernamePasswordInput]: StateNode;
		[AuthState.ValidatingUsernamePasswordInput]: StateNode;
		[AuthState.InvalidUsernamePasswordInput]: StateNode;
	};
}

export type LogOutEvent = { type: AuthEventType.LOG_OUT };
export type SubmitUsernameEvent = { type: AuthEventType.SUBMIT_USERNAME; username: string };
export type SubmitOTPEvent = { type: AuthEventType.SUBMIT_OTP; password: string };
export type SubmitUsernameAndPasswordEvent = {
	type: AuthEventType.SUBMIT_USERNAME_AND_PASSWORD;
	username: string;
	password: string;
};

export type GoBackEvent = { type: AuthEventType.GO_BACK };

export type SubmitPINEvent = { type: AuthEventType.SUBMIT_PIN; pin: string };
export type SubmitPINConfirmationEvent = {
	type: AuthEventType.SUBMIT_PIN_CONFIRMATION;
	pinConfirmation: string;
};
export type SkipPINEvent = { type: AuthEventType.SKIP_PIN };
export type RevokePINEvent = { type: AuthEventType.REVOKE_PIN };

export type AuthEvent<UserType> =
	| GoBackEvent
	| LogOutEvent
	| SubmitUsernameEvent
	| SubmitOTPEvent
	| SubmitUsernameAndPasswordEvent
	| SubmitPINEvent
	| SubmitPINConfirmationEvent
	| SkipPINEvent
	| RevokePINEvent
	| DoneInvokeEvent<{ data: UserType }>;

export type AuthServiceFunctions<UserType, SessionType> = {
	[AuthServices.currentSession]: () => Promise<SessionType>;
	[AuthServices.validateUsernameAndPassword]: (
		username: string,
		password: string
	) => Promise<UserType>;
	[AuthServices.validateUsername]: (username: string) => Promise<UserType>;
	[AuthServices.validateOtp]: (user: UserType, password: string) => Promise<UserType>;
	[AuthServices.checkHasPINSet]: () => Promise<null>;
	[AuthServices.validatePIN]: (pin: string) => Promise<null>;
	[AuthServices.setNewPIN]: (pin: string) => Promise<null>;
	[AuthServices.revokePIN]: () => Promise<null>;
	[AuthServices.signOut]: () => Promise<null>;
};
