import { StateNode } from "xstate";

export interface AuthenticatorContext<UserType> {
	isLoading: boolean;
	useOtpAuth: boolean;
	user: UserType | null;
}

export interface AuthenticatorSchema {
	states: {
		checkingSession: StateNode;
		userIdentifierInput: StateNode;
		otpInput: StateNode;
		usernamePasswordInput: StateNode;
		authorised: StateNode;
		loggingOut: StateNode;
	};
}

export type LogOutEvent = { type: "LOG_OUT" };
export type NetworkReqEvent = { type: "NETWORK_REQUEST_IN_PROGRESS" };
export type NetworkReqCompleteEvent = { type: "NETWORK_REQUEST_COMPLETE" };
export type OTPRetriesExceededEvent = { type: "OTP_RETRIES_EXCEEDED" };
export type UserDetailsReceivedEvent<UserType> = { type: "USER_DETAILS_RECEIVED"; data: UserType };

export type AuthenticatorEvents<UserType> =
	| LogOutEvent
	| NetworkReqEvent
	| NetworkReqCompleteEvent
	| OTPRetriesExceededEvent
	| UserDetailsReceivedEvent<UserType>;

export type AuthenticatorServiceFunctions<UserType, SessionType> = {
	checkSession: () => Promise<SessionType>;
	validateUsername: (username: string) => Promise<UserType>;
	validateOtp: (user: UserType, otp: string) => Promise<UserType>;
	logOut: () => Promise<null>;
};
