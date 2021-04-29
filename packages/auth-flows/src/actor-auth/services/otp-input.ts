import {
	assign,
	createMachine,
	DoneInvokeEvent,
	MachineConfig,
	MachineOptions,
	sendParent,
	StateMachine,
} from "xstate";

import type { AuthEvent, User, OTPInputContext, OTPInputSchema } from "../types";

const otpInputConfig: MachineConfig<OTPInputContext, OTPInputSchema, AuthEvent> = {
	initial: "awaitingOtp",
	context: {
		otp: "",
		remainingOtpRetries: 0,
		userData: null,
	},
	states: {
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
			entry: sendParent({ type: "NETWORK_REQUEST.INITIALISED" } as AuthEvent),
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
			entry: sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthEvent),
			on: {
				"OTP_FLOW.SUBMIT_OTP": {
					actions: assign({ otp: (_, e) => e.password }),
					target: "validatingOtp",
				},
			},
		},
		validOtp: {
			entry: [
				sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthEvent),
				sendParent(
					(ctx) => ({ type: "GLOBAL_AUTH.NEW_USER_DATA", userData: ctx.userData } as AuthEvent)
				),
				sendParent({ type: "OTP_FLOW.OTP_VALIDATED" } as AuthEvent),
			],
			type: "final",
		},
	},
};

const otpInputOptions: MachineOptions<OTPInputContext, AuthEvent> = {
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
): StateMachine<OTPInputContext, OTPInputSchema, AuthEvent> {
	const machine = createMachine(otpInputConfig, otpInputOptions);
	return (machine as StateMachine<OTPInputContext, OTPInputSchema, AuthEvent>).withConfig({
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
