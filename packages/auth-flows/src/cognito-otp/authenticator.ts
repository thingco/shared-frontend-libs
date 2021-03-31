import { assign, DoneInvokeEvent, Machine, MachineConfig, MachineOptions } from "xstate";

import type {
	CognitoOTPAuthenticatorContext,
	CognitoOTPAuthenticatorSchema,
	CognitoOTPAuthenticatorEvent,
} from "./types";

export const defaultOTPContext: CognitoOTPAuthenticatorContext = {
	otp: "",
	errorMsg: "",
	otpEntryRetries: 3,
	userToken: null,
	userIdentifier: "",
	sessionToken: null,
};

export const cognitoOTPAuthenticatorConfig: MachineConfig<
	CognitoOTPAuthenticatorContext,
	CognitoOTPAuthenticatorSchema,
	CognitoOTPAuthenticatorEvent
> = {
	id: "authenticator",
	initial: "init",
	context: defaultOTPContext,
	states: {
		init: {
			invoke: {
				id: "sessionCheck",
				src: "checkSession",
				onDone: {
					actions: ["assignSessionToken"],
					target: "authorised",
				},
				onError: {
					target: "awaitingUserIdentifier",
				},
			},
		},
		awaitingUserIdentifier: {
			on: {
				SUBMIT_USER_IDENTIFIER: {
					actions: ["mergeUserIdentifier"],
					target: "validatingUserIdentifier",
				},
			},
		},
		validatingUserIdentifier: {
			invoke: {
				id: "userIdentifierCheck",
				src: "validateUserIdentifier",
				onDone: {
					target: "awaitingOtp",
					actions: assign<CognitoOTPAuthenticatorContext, DoneInvokeEvent<any>>({
						userToken: (_ctx: CognitoOTPAuthenticatorContext, e: any) => e.data,
						errorMsg: "",
					}),
				},
				onError: {
					target: "awaitingUserIdentifier",
					actions: assign<CognitoOTPAuthenticatorContext>({
						userIdentifier: "",
						errorMsg: `User not found on system`,
					}),
				},
			},
		},
		awaitingOtp: {
			on: {
				SUBMIT_OTP: {
					actions: ["mergeOtp"],
					target: "validatingOtp",
				},
			},
		},
		validatingOtp: {
			invoke: {
				id: "otpCheck",
				src: "validateOtp",
				onDone: {
					target: "validatingSession",
					actions: assign<CognitoOTPAuthenticatorContext, DoneInvokeEvent<any>>({
						userToken: (_ctx: CognitoOTPAuthenticatorContext, e: any) => e.data,
						errorMsg: "",
					}),
				},
				onError: [
					{
						target: "awaitingOtp",
						cond: "hasAvailableOtpRetries",
						actions: assign<CognitoOTPAuthenticatorContext, DoneInvokeEvent<any>>({
							otp: "",
							errorMsg: (ctx) =>
								`Incorrect password: ${(ctx.otpEntryRetries as number) - 1} tries remaining`,
							otpEntryRetries: (ctx) => (ctx.otpEntryRetries as number) - 1,
						}),
					},
					{
						target: "awaitingUserIdentifier",
						cond: "otpRetriesExceeded",
						actions: assign<CognitoOTPAuthenticatorContext>({
							otp: "",
							errorMsg: `Retries exceeded, please enter user identifier`,
							otpEntryRetries: 3,
							userToken: null,
							userIdentifier: "",
						}),
					},
				],
			},
		},
		validatingSession: {
			invoke: {
				id: "sessionValidation",
				src: "checkSession",
				onDone: {
					actions: ["assignSessionToken"],
					target: "authorised",
				},
				onError: {
					target: "awaitingUserIdentifier",
				},
			},
		},
		logOut: {
			invoke: {
				id: "logOut",
				src: "signOut",
				onError: {
					target: "awaitingUserIdentifier",
					// REVEIW on a logout Error, manually destroy any entries in local storage?
					actions: ["resetContext"],
				},
				onDone: {
					target: "awaitingUserIdentifier",
					actions: ["resetContext"],
				},
			},
		},
		authorised: {
			on: {
				REQUEST_LOG_OUT: {
					target: "logOut",
				},
			},
		},
	},
};

export const cognitoOTPAuthenticatorOptions: MachineOptions<
	CognitoOTPAuthenticatorContext,
	CognitoOTPAuthenticatorEvent
> = {
	actions: {
		mergeOtp: assign<CognitoOTPAuthenticatorContext, CognitoOTPAuthenticatorEvent>({
			otp: (_ctx, { payload }) => payload ?? "",
		}),
		mergeUserIdentifier: assign<CognitoOTPAuthenticatorContext, CognitoOTPAuthenticatorEvent>({
			userIdentifier: (_ctx, { payload }) => payload ?? "",
		}),
		assignSessionToken: assign<CognitoOTPAuthenticatorContext, any>({
			sessionToken: (_ctx: CognitoOTPAuthenticatorContext, e: any) => e.data,
		}),
		resetContext: assign<CognitoOTPAuthenticatorContext, any>({
			...defaultOTPContext,
		}),
	},
	activities: {},
	delays: {},
	guards: {
		hasAvailableOtpRetries: (ctx) => ctx.otpEntryRetries > 0,
		otpRetriesExceeded: (ctx) => ctx.otpEntryRetries <= 0,
	},
	services: {
		checkSession: (_ctx) => {
			throw new Error("No checkSession function defined");
		},
		validateUserIdentifier: (ctx) => {
			throw new Error("No check session function defined");
		},
		validateOtp: (ctx) => {
			throw new Error("No validateOtp function defined");
		},
		signOut: (_ctx) => {
			throw new Error("No signOut function defined");
		},
	},
};

export const CognitoOTPAuthenticator = Machine<
	CognitoOTPAuthenticatorContext,
	CognitoOTPAuthenticatorSchema,
	CognitoOTPAuthenticatorEvent
>(cognitoOTPAuthenticatorConfig, cognitoOTPAuthenticatorOptions);
