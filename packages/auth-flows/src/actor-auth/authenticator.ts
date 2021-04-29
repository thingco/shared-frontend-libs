import { assign, createMachine, MachineConfig, MachineOptions, spawn, StateMachine } from "xstate";

import { AuthServiceId } from "./enums";
import { createOtpInputService } from "./services/otp-input";
import { createOtpUsernameInputService } from "./services/otp-username-input";
import { createPinService } from "./services/pin-service";
import { createSessionCheckService } from "./services/session-check";
import { createSignOutService } from "./services/sign-out";
import { createUsernamePasswordInputService } from "./services/username-password-input";
import { assertEventType } from "./utils";

import type {
	AuthEvent,
	AuthContext,
	AuthSchema,
	AuthServices,
	AuthServiceFunctions,
	AuthenticatorConstructorConfig,
	PinServiceFunctions,
} from "./types";
const createAuthConfig = (
	services: AuthServices
): MachineConfig<AuthContext, AuthSchema, AuthEvent> => ({
	id: "authenticator",
	context: {
		isLoading: false,
		isUsingOtpAuth: true,
		isUsingPinSecurity: true,
		userHasPinSet: false,
		userData: null,
		otpRetriesAllowed: 3,
		sessionCheckRef: null,
		otpUsernameInputRef: null,
		otpInputRef: null,
		usernamePasswordInputRef: null,
		signOutServiceRef: null,
		pinServiceRef: null,
	},
	initial: "sessionCheck",
	entry: [
		assign<AuthContext, AuthEvent>({
			signOutServiceRef: () =>
				spawn(services[AuthServiceId.signOutService], {
					name: AuthServiceId.signOutService,
					autoForward: true,
				}),
		}),
		assign<AuthContext, AuthEvent>({
			pinServiceRef: () => {
				const pinService = services[AuthServiceId.pinInputService];
				if (pinService) {
					return spawn(pinService, { name: AuthServiceId.pinInputService, autoForward: true });
				} else {
					return null;
				}
			},
		}),
	],
	on: {
		"NETWORK_REQUEST.INITIALISED": {
			actions: AuthActionId.toggleLoadingOn,
			internal: true,
		},
		"NETWORK_REQUEST.COMPLETE": {
			actions: AuthActionId.toggleLoadingOff,
			internal: true,
		},
		"GLOBAL_AUTH.NEW_USER_DATA": {
			actions: AuthActionId.mergeNewUserData,
			internal: true,
		},
		"PIN_FLOW.USER_HAS_PIN_SET": {
			actions: AuthActionId.userHasPinSet,
			internal: true,
		},
	},
	states: {
		sessionCheck: {
			entry: assign<AuthContext, AuthEvent>({
				sessionCheckRef: () =>
					spawn(services[AuthServiceId.sessionCheckService], {
						name: AuthServiceId.sessionCheckService,
					}),
			}),
			on: {
				"GLOBAL_AUTH.ACTIVE_SESSION_PRESENT": [
					{
						cond: AuthCondId.shouldSetUpPinSecurity,
						target: "newPinInput",
					},
					{
						cond: AuthCondId.isUsingPinSecurity,
						target: "pinInput",
					},
					{
						target: "authorised",
					},
				],
				"GLOBAL_AUTH.NO_ACTIVE_SESSION_PRESENT": [
					{
						cond: AuthCondId.isUsingOtpAuth,
						actions: AuthActionId.clearStaleUserData,
						target: "otpUsernameInput",
					},
					{
						actions: AuthActionId.clearStaleUserData,
						target: "usernamePasswordInput",
					},
				],
			},
		},
		otpUsernameInput: {
			entry: assign<AuthContext, AuthEvent>({
				otpUsernameInputRef: () =>
					spawn(services[AuthServiceId.otpUsernameInputService], {
						name: AuthServiceId.otpUsernameInputService,
						autoForward: true,
					}),
			}),
			on: {
				"OTP_FLOW.USERNAME_VALIDATED": "otpInput",
			},
		},
		otpInput: {
			entry: assign<AuthContext, AuthEvent>({
				otpInputRef: (ctx) =>
					spawn(
						services[AuthServiceId.otpInputService].withContext({
							otp: "",
							remainingOtpRetries: ctx.otpRetriesAllowed,
							userData: ctx.userData,
						}),
						{
							name: AuthServiceId.otpInputService,
							autoForward: true,
						}
					),
			}),
			on: {
				"GLOBAL_AUTH.GO_BACK": "otpUsernameInput",
				"OTP_FLOW.OTP_RETRIES_EXCEEDED": "otpUsernameInput",
				"OTP_FLOW.OTP_VALIDATED": [
					{
						target: "pinInput",
						cond: AuthCondId.isUsingPinSecurity,
					},
					{
						target: "authorised",
					},
				],
			},
		},
		usernamePasswordInput: {
			entry: assign<AuthContext, AuthEvent>({
				usernamePasswordInputRef: () =>
					spawn(services[AuthServiceId.usernamePasswordInputService], {
						name: AuthServiceId.usernamePasswordInputService,
						autoForward: true,
					}),
			}),
			on: {
				"USERNAME_PASSWORD_FLOW.VALIDATED": [
					{
						target: "pinInput",
						cond: AuthCondId.isUsingPinSecurity,
					},
					{
						target: "authorised",
					},
				],
			},
		},
		newPinInput: {
			on: {
				"PIN_FLOW.SKIP_SETTING_PIN": {
					target: "authorised",
				},
				"PIN_FLOW.NEW_PIN_SET": {
					actions: AuthActionId.pinSet,
					target: "authorised",
				},
			},
		},
		resetPinInput: {
			on: {
				"PIN_FLOW.NEW_PIN_SET": {
					actions: AuthActionId.pinSet,
					target: "authorised",
				},
			},
		},
		pinInput: {
			on: {
				"PIN_FLOW.PIN_VALIDATED": "authorised",
			},
		},
		authorised: {
			on: {
				"SIGN_OUT.COMPLETE": {
					actions: AuthActionId.clearStaleUserData,
					target: "sessionCheck",
				},
				"PIN_FLOW.TURN_OFF_PIN_SECURITY": {
					actions: AuthActionId.togglePinSecurityOff,
					internal: true,
				},
				"PIN_FLOW.TURN_ON_PIN_SECURITY": {
					actions: AuthActionId.togglePinSecurityOn,
					target: "newPinInput",
				},
				"PIN_FLOW.CHANGE_CURRENT_PIN": [
					{ cond: AuthCondId.isUsingPinSecurity, target: "resetPinInput" },
				],
			},
		},
	},
});

export const enum AuthActionId {
	clearStaleUserData = "clearStaleUserData",
	mergeNewUserData = "mergeNewUserData",
	toggleLoadingOff = "toggleLoadingOff",
	toggleLoadingOn = "toggleLoadingOn",
	togglePinSecurityOff = "togglePinSecurityOff",
	togglePinSecurityOn = "togglePinSecurityOn",
	userHasPinSet = "userHasPinSet",
	pinCleared = "pinCleared",
	pinSet = "pinSet",
}

export const enum AuthCondId {
	isUsingOtpAuth = "isUsingOtpAuth",
	isUsingPinSecurity = "isUsingPinSecurity",
	shouldSetUpPinSecurity = "shouldSetUpPinSecurity",
}

const authOptions: MachineOptions<AuthContext, AuthEvent> = {
	actions: {
		[AuthActionId.clearStaleUserData]: assign<AuthContext, AuthEvent>({ userData: () => null }),
		[AuthActionId.mergeNewUserData]: assign<AuthContext, AuthEvent>({
			userData: (_, e) => {
				assertEventType(e, "GLOBAL_AUTH.NEW_USER_DATA");
				return e.userData;
			},
		}),
		[AuthActionId.toggleLoadingOff]: assign<AuthContext, AuthEvent>({ isLoading: () => false }),
		[AuthActionId.toggleLoadingOn]: assign<AuthContext, AuthEvent>({ isLoading: () => true }),
		[AuthActionId.togglePinSecurityOff]: assign<AuthContext, AuthEvent>({
			isUsingPinSecurity: () => false,
		}),
		[AuthActionId.togglePinSecurityOn]: assign<AuthContext, AuthEvent>({
			isUsingPinSecurity: () => true,
		}),
		[AuthActionId.userHasPinSet]: assign<AuthContext, AuthEvent>({
			userHasPinSet: (_, e) => {
				assertEventType(e, "PIN_FLOW.USER_HAS_PIN_SET");
				return e.userHasPinSet;
			},
		}),
		[AuthActionId.pinCleared]: assign<AuthContext, AuthEvent>({ userHasPinSet: () => false }),
		[AuthActionId.pinSet]: assign<AuthContext, AuthEvent>({ userHasPinSet: () => true }),
	},
	activities: {},
	delays: {},
	guards: {
		[AuthCondId.isUsingOtpAuth]: (ctx) => ctx.isUsingOtpAuth,
		[AuthCondId.isUsingPinSecurity]: (ctx) =>
			ctx.pinServiceRef !== null && ctx.isUsingPinSecurity && ctx.userHasPinSet,
		[AuthCondId.shouldSetUpPinSecurity]: (ctx) =>
			ctx.pinServiceRef !== null && ctx.isUsingPinSecurity && !ctx.userHasPinSet,
	},
	services: {},
};

export function createAuthServices(
	authServiceFunctions: AuthServiceFunctions,
	pinServiceFunctions?: PinServiceFunctions
): AuthServices {
	return {
		[AuthServiceId.sessionCheckService]: createSessionCheckService(
			authServiceFunctions.checkSession
		),
		[AuthServiceId.otpUsernameInputService]: createOtpUsernameInputService(
			authServiceFunctions.validateOtpUsername
		),
		[AuthServiceId.otpInputService]: createOtpInputService(authServiceFunctions.validateOtp),
		[AuthServiceId.usernamePasswordInputService]: createUsernamePasswordInputService(
			authServiceFunctions.validateUsernamePassword
		),
		[AuthServiceId.signOutService]: createSignOutService(authServiceFunctions.signOut),
		[AuthServiceId.pinInputService]: pinServiceFunctions
			? createPinService(pinServiceFunctions)
			: null,
	};
}

export function createAuthenticator(
	authConstructorConfig: AuthenticatorConstructorConfig
): StateMachine<AuthContext, AuthSchema, AuthEvent> {
	const authServices = createAuthServices(
		authConstructorConfig.authServiceFunctions,
		authConstructorConfig.pinServiceFunctions
	);
	const authConfig = createAuthConfig(authServices);
	const authMachine = createMachine(authConfig, authOptions);

	return (authMachine as StateMachine<AuthContext, AuthSchema, AuthEvent>).withContext({
		...(authMachine.context as AuthContext),
	});
}
