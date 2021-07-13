import {
	assign,
	createMachine,
	MachineConfig,
	MachineOptions,
	send,
	spawn,
	StateMachine,
} from "xstate";
import { respond } from "xstate/lib/actions";

import { AuthenticatorServiceId } from "./enums";
import { createOtpInputService } from "./services/otp-input";
import { createOtpUsernameInputService } from "./services/otp-username-input";
import { createPinService } from "./services/pin-service";
import { createSessionCheckService } from "./services/session-check";
import { createSignOutService } from "./services/sign-out";
import { createUsernamePasswordInputService } from "./services/username-password-input";
import { assertEventType } from "./utils";

import type {
	AuthenticatorEvent,
	AuthenticatorContext,
	AuthenticatorSchema,
	AuthenticatorServices,
	AuthenticatorServiceFunctions,
	AuthenticatorFactoryConfig,
	PinServiceFunctions,
} from "./types";

const createAuthConfig = (
	services: AuthenticatorServices
): MachineConfig<AuthenticatorContext, AuthenticatorSchema, AuthenticatorEvent> => ({
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
		assign<AuthenticatorContext, AuthenticatorEvent>({
			signOutServiceRef: () =>
				spawn(services[AuthenticatorServiceId.signOutService], {
					name: AuthenticatorServiceId.signOutService,
					autoForward: true,
				}),
		}),
		assign<AuthenticatorContext, AuthenticatorEvent>({
			pinServiceRef: () => {
				const pinService = services[AuthenticatorServiceId.pinInputService];
				if (pinService) {
					console.log(
						"@thingco/auth-flows: PIN Service is running. Note that if this is a browser app, then the PIN service probably shouldn't be turned on."
					);
					return spawn(pinService, {
						name: AuthenticatorServiceId.pinInputService,
						autoForward: true,
					});
				} else {
					return null;
				}
			},
		}),
	],
	on: {
		"NETWORK_REQUEST.INITIALISED": {
			actions: AuthenticatorActionId.toggleLoadingOn,
			internal: true,
		},
		"NETWORK_REQUEST.COMPLETE": {
			actions: AuthenticatorActionId.toggleLoadingOff,
			internal: true,
		},
		"GLOBAL_AUTH.NEW_USER_DATA": {
			actions: AuthenticatorActionId.mergeNewUserData,
			internal: true,
		},
		"OTP_FLOW.REQUEST_OTP_STAGE_INIT_DATA": {
			actions: respond((ctx) => ({
				type: "OTP_FLOW.SEND_OTP_STAGE_INIT_DATA",
				otpRetriesAllowed: ctx.otpRetriesAllowed,
				userData: ctx.userData,
			})),
			internal: true,
		},
		"PIN_FLOW.USER_HAS_PIN_SET": {
			actions: AuthenticatorActionId.userHasPinSet,
			internal: true,
		},
	},
	states: {
		sessionCheck: {
			entry: assign<AuthenticatorContext, AuthenticatorEvent>({
				sessionCheckRef: () =>
					spawn(services[AuthenticatorServiceId.sessionCheckService], {
						name: AuthenticatorServiceId.sessionCheckService,
					}),
			}),
			on: {
				"GLOBAL_AUTH.ACTIVE_SESSION_PRESENT": [
					{
						cond: AuthenticatorCondId.shouldSetUpPinSecurity,
						target: "newPinInput",
					},
					{
						cond: AuthenticatorCondId.isUsingPinSecurity,
						target: "pinInput",
					},
					{
						target: "authorised",
					},
				],
				"GLOBAL_AUTH.NO_ACTIVE_SESSION_PRESENT": [
					{
						cond: AuthenticatorCondId.isUsingOtpAuth,
						actions: AuthenticatorActionId.clearStaleUserData,
						target: "otpUsernameInput",
					},
					{
						actions: AuthenticatorActionId.clearStaleUserData,
						target: "usernamePasswordInput",
					},
				],
			},
		},
		otpUsernameInput: {
			entry: assign<AuthenticatorContext, AuthenticatorEvent>({
				otpUsernameInputRef: () =>
					spawn(services[AuthenticatorServiceId.otpUsernameInputService], {
						name: AuthenticatorServiceId.otpUsernameInputService,
						autoForward: true,
					}),
			}),
			on: {
				"OTP_FLOW.USERNAME_VALIDATED": "otpInput",
			},
		},
		otpInput: {
			entry: assign<AuthenticatorContext, AuthenticatorEvent>({
				otpInputRef: () =>
					spawn(services[AuthenticatorServiceId.otpInputService], {
						name: AuthenticatorServiceId.otpInputService,
						autoForward: true,
					}),
			}),
			on: {
				"GLOBAL_AUTH.GO_BACK": "otpUsernameInput",
				"OTP_FLOW.OTP_RETRIES_EXCEEDED": "otpUsernameInput",
				"OTP_FLOW.OTP_VALIDATED": [
					{
						target: "newPinInput",
						cond: AuthenticatorCondId.shouldSetUpPinSecurity,
					},
					{
						target: "pinInput",
						cond: AuthenticatorCondId.isUsingPinSecurity,
					},
					{
						target: "authorised",
					},
				],
			},
		},
		usernamePasswordInput: {
			entry: assign<AuthenticatorContext, AuthenticatorEvent>({
				usernamePasswordInputRef: () =>
					spawn(services[AuthenticatorServiceId.usernamePasswordInputService], {
						name: AuthenticatorServiceId.usernamePasswordInputService,
						autoForward: true,
					}),
			}),
			on: {
				"USERNAME_PASSWORD_FLOW.VALIDATED": [
					{
						target: "newPinInput",
						cond: AuthenticatorCondId.shouldSetUpPinSecurity,
					},
					{
						target: "pinInput",
						cond: AuthenticatorCondId.isUsingPinSecurity,
					},
					{
						target: "authorised",
					},
				],
			},
		},
		pinInput: {
			entry: send({ type: "PIN_FLOW.VALIDATE_CURRENT_PIN" } as AuthenticatorEvent),
			on: {
				"PIN_FLOW.PIN_VALIDATED": "authorised",
				"GLOBAL_AUTH.GO_BACK": {
					target: "sessionCheck",
				},
			},
		},
		resetPinInput: {
			entry: send({ type: "PIN_FLOW.CHANGE_CURRENT_PIN" } as AuthenticatorEvent),
			on: {
				"PIN_FLOW.PIN_VALIDATED": {
					actions: AuthenticatorActionId.pinCleared,
					target: "newPinInput",
				},
			},
		},
		newPinInput: {
			entry: send({ type: "PIN_FLOW.SET_UP_PIN" } as AuthenticatorEvent),
			on: {
				"PIN_FLOW.SKIP_SETTING_PIN": {
					target: "authorised",
				},
				"PIN_FLOW.NEW_PIN_SET": {
					actions: AuthenticatorActionId.pinSet,
					target: "authorised",
				},
				"GLOBAL_AUTH.GO_BACK": {
					target: "sessionCheck",
				},
			},
		},
		authorised: {
			on: {
				"SIGN_OUT.COMPLETE": {
					actions: AuthenticatorActionId.clearStaleUserData,
					target: "sessionCheck",
				},
				"PIN_FLOW.TURN_OFF_PIN_SECURITY": {
					actions: AuthenticatorActionId.togglePinSecurityOff,
					internal: true,
				},
				"PIN_FLOW.TURN_ON_PIN_SECURITY": {
					actions: AuthenticatorActionId.togglePinSecurityOn,
					target: "newPinInput",
				},
				"PIN_FLOW.CHANGE_CURRENT_PIN": {
					cond: AuthenticatorCondId.isUsingPinSecurity,
					target: "resetPinInput",
				},
			},
		},
	},
});

export const enum AuthenticatorActionId {
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

export const enum AuthenticatorCondId {
	isUsingOtpAuth = "isUsingOtpAuth",
	isUsingPinSecurity = "isUsingPinSecurity",
	shouldSetUpPinSecurity = "shouldSetUpPinSecurity",
}

const authenticatorOptions: MachineOptions<AuthenticatorContext, AuthenticatorEvent> = {
	actions: {
		[AuthenticatorActionId.clearStaleUserData]: assign<AuthenticatorContext, AuthenticatorEvent>({
			userData: () => null,
		}),
		[AuthenticatorActionId.mergeNewUserData]: assign<AuthenticatorContext, AuthenticatorEvent>({
			userData: (_, e) => {
				assertEventType(e, "GLOBAL_AUTH.NEW_USER_DATA");
				return e.userData;
			},
		}),
		[AuthenticatorActionId.toggleLoadingOff]: assign<AuthenticatorContext, AuthenticatorEvent>({
			isLoading: () => false,
		}),
		[AuthenticatorActionId.toggleLoadingOn]: assign<AuthenticatorContext, AuthenticatorEvent>({
			isLoading: () => true,
		}),
		[AuthenticatorActionId.togglePinSecurityOff]: assign<AuthenticatorContext, AuthenticatorEvent>({
			isUsingPinSecurity: () => false,
		}),
		[AuthenticatorActionId.togglePinSecurityOn]: assign<AuthenticatorContext, AuthenticatorEvent>({
			isUsingPinSecurity: () => true,
		}),
		[AuthenticatorActionId.userHasPinSet]: assign<AuthenticatorContext, AuthenticatorEvent>({
			userHasPinSet: (_, e) => {
				assertEventType(e, "PIN_FLOW.USER_HAS_PIN_SET");
				return e.userHasPinSet;
			},
		}),
		[AuthenticatorActionId.pinCleared]: assign<AuthenticatorContext, AuthenticatorEvent>({
			userHasPinSet: () => false,
		}),
		[AuthenticatorActionId.pinSet]: assign<AuthenticatorContext, AuthenticatorEvent>({
			userHasPinSet: () => true,
		}),
	},
	activities: {},
	delays: {},
	guards: {
		[AuthenticatorCondId.isUsingOtpAuth]: (ctx) => ctx.isUsingOtpAuth,
		[AuthenticatorCondId.isUsingPinSecurity]: (ctx) =>
			ctx.pinServiceRef !== null && ctx.isUsingPinSecurity && ctx.userHasPinSet,
		[AuthenticatorCondId.shouldSetUpPinSecurity]: (ctx) =>
			ctx.pinServiceRef !== null && ctx.isUsingPinSecurity && !ctx.userHasPinSet,
	},
	services: {},
};

export function createAuthenticatorServices(
	authServiceFunctions: AuthenticatorServiceFunctions,
	pinServiceFunctions?: PinServiceFunctions
): AuthenticatorServices {
	return {
		[AuthenticatorServiceId.sessionCheckService]: createSessionCheckService(
			authServiceFunctions.checkSession
		),
		[AuthenticatorServiceId.otpUsernameInputService]: createOtpUsernameInputService(
			authServiceFunctions.validateOtpUsername
		),
		[AuthenticatorServiceId.otpInputService]: createOtpInputService(
			authServiceFunctions.validateOtp
		),
		[AuthenticatorServiceId.usernamePasswordInputService]: createUsernamePasswordInputService(
			authServiceFunctions.validateUsernamePassword
		),
		[AuthenticatorServiceId.signOutService]: createSignOutService(authServiceFunctions.signOut),
		[AuthenticatorServiceId.pinInputService]: pinServiceFunctions
			? createPinService(pinServiceFunctions)
			: null,
	};
}

export function createAuthenticator(
	authenticatorFactoryConfig: AuthenticatorFactoryConfig
): StateMachine<AuthenticatorContext, AuthenticatorSchema, AuthenticatorEvent> {
	const authenticatorServices = createAuthenticatorServices(
		authenticatorFactoryConfig.authServiceFunctions,
		authenticatorFactoryConfig.pinServiceFunctions
	);
	const authenticatorConfig = createAuthConfig(authenticatorServices);
	const authenticator = createMachine(authenticatorConfig, authenticatorOptions);

	return (authenticator as StateMachine<
		AuthenticatorContext,
		AuthenticatorSchema,
		AuthenticatorEvent
	>).withContext({
		...(authenticator.context as AuthenticatorContext),
		isUsingOtpAuth: authenticatorFactoryConfig.useOtpAuth || true,
		otpRetriesAllowed: authenticatorFactoryConfig.allowedOtpRetries || 0,
		isUsingPinSecurity: authenticatorFactoryConfig.usePinSecurity || false,
	});
}
