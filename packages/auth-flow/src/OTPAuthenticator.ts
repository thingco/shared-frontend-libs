import {
	assign,
	DoneInvokeEvent,
	Machine,
	MachineConfig,
	MachineOptions,
} from "xstate";

import { defaultOTPAuthServices } from "./OTPAuthServices";

import type {
	OTPAuthenticatorContext,
	OTPAuthenticatorSchema,
	OTPAuthenticatorEvent,
} from "./OTPAuthTypes";

export const defaultOTPContext: OTPAuthenticatorContext = {
	otp: "",
	errorMsg: "",
	otpEntryRetries: 3,
	userToken: null,
	userIdentifier: "",
	sessionToken: null,
};

const otpAuthenticatorConfig: MachineConfig<
	OTPAuthenticatorContext,
	OTPAuthenticatorSchema,
	OTPAuthenticatorEvent
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
					actions: assign<OTPAuthenticatorContext, DoneInvokeEvent<any>>({
						sessionToken: (_ctx: OTPAuthenticatorContext, e: any) => e.data,
					}),
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
					target: "awaitingCode",
					actions: assign<OTPAuthenticatorContext, DoneInvokeEvent<any>>({
						userToken: (_ctx: OTPAuthenticatorContext, e: any) => e.data,
						errorMsg: "",
					}),
				},
				onError: {
					target: "awaitingUserIdentifier",
					actions: assign<OTPAuthenticatorContext>({
						userIdentifier: "",
						errorMsg: `User not found on system`,
					}),
				},
			},
		},
		awaitingOtp: {
			on: {
				SUBMIT_CODE: {
					actions: ["mergeCode"],
					target: "validatingCode",
				},
			},
		},
		validatingOtp: {
			invoke: {
				id: "codeCheck",
				src: "validateOtp",
				onDone: {
					target: "awaitingSession",
					actions: assign<OTPAuthenticatorContext, DoneInvokeEvent<any>>({
						userToken: (_ctx: OTPAuthenticatorContext, e: any) => e.data,
						errorMsg: "",
					}),
				},
				onError: [
					{
						target: "awaitingCode",
						cond: (ctx) => ctx.otpEntryRetries > 0,
						actions: assign<OTPAuthenticatorContext, DoneInvokeEvent<any>>({
							otp: "",
							errorMsg: (ctx) =>
								`Incorrect code: ${
									(ctx.otpEntryRetries as number) - 1
								} tries remaining`,
							otpEntryRetries: (ctx) => (ctx.otpEntryRetries as number) - 1,
						}),
					},
					{
						target: "awaitingUserIdentifier",
						cond: (ctx) => ctx.otpEntryRetries === 0,
						actions: assign<OTPAuthenticatorContext>({
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
		awaitingSession: {
			invoke: {
				id: "sessionCheck",
				src: "checkSession",
				onDone: {
					actions: assign<OTPAuthenticatorContext, DoneInvokeEvent<any>>({
						sessionToken: (_ctx: OTPAuthenticatorContext, e: any) => e.data,
					}),
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
					// TODO on a logout Error, manually destroy any entries in local storage
					actions: assign<OTPAuthenticatorContext>({ ...defaultOTPContext }),
				},
				onDone: {
					target: "awaitingUserIdentifier",
					actions: assign<OTPAuthenticatorContext, DoneInvokeEvent<any>>({
						...defaultOTPContext,
					}),
				},
			},
		},
		authorised: {
			// type: "final",
			on: {
				REQUEST_LOG_OUT: {
					target: "logOut",
				},
			},
		},
	},
};

const otpAuthenticatorOptions: MachineOptions<
	OTPAuthenticatorContext,
	OTPAuthenticatorEvent
> = {
	actions: {
		mergeCode: assign<OTPAuthenticatorContext, OTPAuthenticatorEvent>({
			otp: (_ctx, { payload }) => payload ?? "",
		}),
		mergeUserIdentifier: assign<OTPAuthenticatorContext, OTPAuthenticatorEvent>(
			{
				userIdentifier: (_ctx, { payload }) => payload ?? "",
			}
		),
	},
	activities: {},
	delays: {},
	guards: {},
	services: defaultOTPAuthServices,
};

export const OTPAuthenticator = Machine<
	OTPAuthenticatorContext,
	OTPAuthenticatorSchema,
	OTPAuthenticatorEvent
>(otpAuthenticatorConfig, otpAuthenticatorOptions);
