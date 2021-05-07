import {
	assign,
	createMachine,
	DoneInvokeEvent,
	MachineConfig,
	MachineOptions,
	sendParent,
	StateMachine,
} from "xstate";

import type { AuthenticatorEvent, User, OTPInputContext, OTPInputSchema } from "../types";

const otpInputConfig: MachineConfig<OTPInputContext, OTPInputSchema, AuthenticatorEvent> = {
	initial: "init",
	context: {
		otp: "",
		remainingOtpRetries: 0,
		userData: null,
	},
	states: {
		init: {
			entry: sendParent({ type: "OTP_FLOW.REQUEST_OTP_STAGE_INIT_DATA" } as AuthenticatorEvent),
			on: {
				"OTP_FLOW.SEND_OTP_STAGE_INIT_DATA": {
					actions: assign({
						remainingOtpRetries: (_, e) => e.otpRetriesAllowed,
						userData: (_, e) => e.userData,
					}),
					target: "awaitingOtp",
				},
			},
		},
		awaitingOtp: {
			on: {
				"OTP_FLOW.SUBMIT_OTP": {
					actions: assign({
						otp: (_, e) => e.password,
					}),
					target: "validatingOtp",
				},
			},
		},
		validatingOtp: {
			entry: sendParent({ type: "NETWORK_REQUEST.INITIALISED" } as AuthenticatorEvent),
			invoke: {
				src: "validateOtp",
				onDone: {
					actions: assign<OTPInputContext, DoneInvokeEvent<User>>({
						userData: (ctx, e) => e.data,
						otp: () => "",
					}),
					target: "validOtp",
				},
				onError: [
					{
						actions: assign<OTPInputContext, DoneInvokeEvent<unknown>>({
							otp: () => "",
							remainingOtpRetries: (ctx) => ctx.remainingOtpRetries - 1,
						}),
						cond: (ctx) => ctx.remainingOtpRetries > 0,
						target: "invalidOtp",
					},
					{
						// NOTE the following action should terminate the machine:
						// sending this message will transition parent state away
						// from the state node that invokes this machine.
						actions: sendParent({ type: "OTP_FLOW.OTP_RETRIES_VALIDATED" }),
					},
				],
			},
		},
		invalidOtp: {
			entry: sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthenticatorEvent),
			on: {
				"OTP_FLOW.SUBMIT_OTP": {
					actions: assign({ otp: (_, e) => e.password }),
					target: "validatingOtp",
				},
			},
		},
		validOtp: {
			entry: [
				sendParent(
					(ctx) =>
						({ type: "GLOBAL_AUTH.NEW_USER_DATA", userData: ctx.userData } as AuthenticatorEvent)
				),
				sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthenticatorEvent),
				sendParent({ type: "OTP_FLOW.OTP_VALIDATED" } as AuthenticatorEvent),
			],
			type: "final",
		},
	},
};

const otpInputOptions: MachineOptions<OTPInputContext, AuthenticatorEvent> = {
	actions: {},
	activities: {},
	delays: {},
	guards: {},
	services: {
		validateOtp: (): Promise<unknown> => {
			throw new Error("No service defined");
		},
	},
};

export function createOtpInputService(
	validateOtpFn: (user: User, username: string) => Promise<User>
): StateMachine<OTPInputContext, OTPInputSchema, AuthenticatorEvent> {
	const machine = createMachine(otpInputConfig, otpInputOptions);
	return (machine as StateMachine<OTPInputContext, OTPInputSchema, AuthenticatorEvent>).withConfig({
		services: {
			validateOtp: (ctx) => {
				if (ctx.userData === null) {
					throw new Error(
						"No user data object available to pass into OTP validation function. Have you validated the username? The respone from that should have returned the user object."
					);
				}
				return validateOtpFn(ctx.userData, ctx.otp);
			},
		},
	});
}
