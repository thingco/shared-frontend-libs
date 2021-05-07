import { ActorRef, StateMachine, StateNode } from "xstate";

import { AuthenticatorServiceId, PinServiceId } from "./enums";

export type User = Record<string, unknown>;

/**
 * The authenticator context contains a set of values that are either:
 *
 * - Set on creation, and used conditionally within the machine (the
 *   `isUsingOtpAuth` boolean flag, for example).
 * - Useful to the UI at all times (`isLoading` or `userData`, for example).
 * - References to spawned services (actors, `sessionCheckRef` for example). Those
 *   services always have events forwarded to them, an communicate only via
 *   message passing.
 */
export interface AuthenticatorContext {
	/**
	 * Services will send a message to the authenticator machine every time a
	 * network request starts or stops: these switch the isLoading flag on or off.
	 * Relevant parts of the UI can then be programmed against this.
	 */
	isLoading: boolean;
	/**
	 * The auth flow [currently] may use OTP or drop back to using username/password
	 * authentication.
	 *
	 * TODO Allow this to be toggled while the machine is running: currently it
	 * is just one or the other, set on creation.
	 */
	isUsingOtpAuth: boolean;
	/**
	 * If the auth flow is running on a mobile device, it can have a PIN security
	 * stage (it makes no sense on web). This is a second layer after the server-
	 * based auth has been passed.
	 */
	isUsingPinSecurity: boolean;
	/**
	 * If pin security is enabled and the service is running, the first thing it
	 * will check is if there is a pin set. This value can then be updated, which
	 * will help to decide which state to move to when pin-related states are reached.
	 */
	userHasPinSet: boolean;
	/**
	 * The server-based auth will return some data specific to the user: for Cognito,
	 * this is a CognitUser object. It will have useful information about the user
	 * that the UI can use or may need access to. It is also necesssary (when using
	 * Cognito) to pass the object into the function that validates the user's OTP.
	 */
	userData: User | null;
	/**
	 * If a OTP flow is being used, a user has a set number of retries
	 */
	otpRetriesAllowed: number;
	/**
	 * Refs for spawned services
	 */
	sessionCheckRef: ActorRef<AuthenticatorEvent> | null;
	otpUsernameInputRef: ActorRef<AuthenticatorEvent> | null;
	otpInputRef: ActorRef<AuthenticatorEvent> | null;
	usernamePasswordInputRef: ActorRef<AuthenticatorEvent> | null;
	signOutServiceRef: ActorRef<AuthenticatorEvent> | null;
	pinServiceRef: ActorRef<AuthenticatorEvent> | null;
}

export interface AuthenticatorSchema {
	states: {
		sessionCheck: StateNode;
		otpUsernameInput: StateNode;
		otpInput: StateNode;
		usernamePasswordInput: StateNode;
		resetPinInput: StateNode;
		newPinInput: StateNode;
		pinInput: StateNode;
		authorised: StateNode;
	};
}

export interface SessionCheckSchema {
	states: {
		checkingSession: StateNode;
		sessionCheckComplete: StateNode;
	};
}

export interface OTPUsernameInputContext {
	username: string;
	userData: User | null;
}

export interface OTPUsernameInputSchema {
	states: {
		awaitingOtpUsername: StateNode;
		validatingOtpUsername: StateNode;
		invalidOtpUsername: StateNode;
		validOtpUsername: StateNode;
	};
}
export interface OTPInputContext {
	otp: string;
	remainingOtpRetries: number;
	userData: User | null;
}

export interface OTPInputSchema {
	states: {
		init: StateNode;
		awaitingOtp: StateNode;
		validatingOtp: StateNode;
		invalidOtp: StateNode;
		validOtp: StateNode;
	};
}

export interface UsernamePasswordInputContext {
	username: string;
	password: string;
	userData: User | null;
}

export interface UsernamePasswordInputSchema {
	states: {
		awaitingUsernamePassword: StateNode;
		validatingUsernamePassword: StateNode;
		invalidUsernamePassword: StateNode;
		validUsernamePassword: StateNode;
	};
}

export interface SignOutSchema {
	states: {
		idle: StateNode;
		signingOut: StateNode;
		signedOut: StateNode;
	};
}

export interface PinServiceContext {
	pin: string;
}

export interface PinServiceSchema {
	states: {
		checkingForExistingPin: StateNode;
		clearExistingPin: StateNode;
		idle: StateNode;
		awaitingPin: StateNode;
		validatingPin: StateNode;
		awaitingCurrentPinForReset: StateNode;
		validatingCurrentPinForReset: StateNode;
		clearingCurrentPinForReset: StateNode;
		awaitingNewPin: StateNode;
		settingNewPin: StateNode;
	};
}

export type AuthenticatorEvent =
	| { type: "GLOBAL_AUTH.ACTIVE_SESSION_PRESENT" }
	| { type: "GLOBAL_AUTH.NO_ACTIVE_SESSION_PRESENT" }
	| { type: "GLOBAL_AUTH.NEW_USER_DATA"; userData: User }
	| { type: "GLOBAL_AUTH.GO_BACK" }
	| { type: "NETWORK_REQUEST.INITIALISED" }
	| { type: "NETWORK_REQUEST.COMPLETE" }
	| { type: "OTP_FLOW.SUBMIT_USERNAME"; username: string }
	| { type: "OTP_FLOW.USERNAME_VALIDATED" }
	| { type: "OTP_FLOW.SUBMIT_OTP"; password: string }
	| { type: "OTP_FLOW.REQUEST_OTP_STAGE_INIT_DATA" }
	| { type: "OTP_FLOW.SEND_OTP_STAGE_INIT_DATA"; otpRetriesAllowed: number; userData: User }
	| { type: "OTP_FLOW.OTP_VALIDATED" }
	| { type: "OTP_FLOW.OTP_RETRIES_EXCEEDED" }
	| { type: "USERNAME_PASSWORD_FLOW.INPUT"; username: string; password: string }
	| { type: "USERNAME_PASSWORD_FLOW.VALIDATED" }
	| { type: "SIGN_OUT.INITIALISE" }
	| { type: "SIGN_OUT.COMPLETE" }
	| { type: "PIN_FLOW.TURN_ON_PIN_SECURITY" }
	| { type: "PIN_FLOW.TURN_OFF_PIN_SECURITY" }
	| { type: "PIN_FLOW.USER_HAS_PIN_SET"; userHasPinSet: boolean }
	| { type: "PIN_FLOW.CHANGE_CURRENT_PIN" }
	| { type: "PIN_FLOW.SET_UP_PIN" }
	| { type: "PIN_FLOW.VALIDATE_CURRENT_PIN" }
	| { type: "PIN_FLOW.SKIP_SETTING_PIN" }
	| { type: "PIN_FLOW.SUBMIT_PIN"; pin: string }
	| { type: "PIN_FLOW.PIN_VALIDATED" }
	| { type: "PIN_FLOW.NEW_PIN_SET" };

export interface AuthenticatorServices {
	[AuthenticatorServiceId.sessionCheckService]: StateMachine<
		never,
		SessionCheckSchema,
		AuthenticatorEvent
	>;
	[AuthenticatorServiceId.otpUsernameInputService]: StateMachine<
		OTPUsernameInputContext,
		OTPUsernameInputSchema,
		AuthenticatorEvent
	>;
	[AuthenticatorServiceId.otpInputService]: StateMachine<
		OTPInputContext,
		OTPInputSchema,
		AuthenticatorEvent
	>;
	[AuthenticatorServiceId.usernamePasswordInputService]: StateMachine<
		UsernamePasswordInputContext,
		UsernamePasswordInputSchema,
		AuthenticatorEvent
	>;
	[AuthenticatorServiceId.signOutService]: StateMachine<never, SignOutSchema, AuthenticatorEvent>;
	[AuthenticatorServiceId.pinInputService]: StateMachine<
		PinServiceContext,
		PinServiceSchema,
		AuthenticatorEvent
	> | null;
}

export interface AuthenticatorServiceFunctions {
	checkSession: () => Promise<unknown>;
	validateOtpUsername: (username: string) => Promise<User>;
	validateOtp: (user: User, password: string) => Promise<User>;
	validateUsernamePassword: (username: string, password: string) => Promise<User>;
	signOut: () => Promise<null>;
}

export interface PinServiceFunctions {
	[PinServiceId.hasPinSet]: () => Promise<boolean>;
	[PinServiceId.validatePin]: (pin: string) => Promise<null>;
	[PinServiceId.setNewPin]: (pin: string) => Promise<null>;
	[PinServiceId.clearPin]: () => Promise<null>;
}

export interface AuthenticatorFactoryConfig {
	useOtpAuth: boolean;
	usePinSecurity: boolean;
	allowedOtpRetries: number;
	authServiceFunctions: AuthenticatorServiceFunctions;
	pinServiceFunctions?: PinServiceFunctions;
}
