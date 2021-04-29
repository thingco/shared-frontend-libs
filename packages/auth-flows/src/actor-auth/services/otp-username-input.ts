import {
	assign,
	createMachine,
	DoneInvokeEvent,
	MachineConfig,
	MachineOptions,
	sendParent,
	StateMachine,
} from "xstate";

import type { AuthEvent, User, OTPUsernameInputContext, OTPUsernameInputSchema } from "../types";

const otpUsernameInputConfig: MachineConfig<
	OTPUsernameInputContext,
	OTPUsernameInputSchema,
	AuthEvent
> = {
	initial: "awaitingOtpUsername",
	context: {
		username: "",
		userData: null,
	},
	states: {
		awaitingOtpUsername: {
			on: {
				"OTP_FLOW.SUBMIT_USERNAME": {
					actions: assign({
						username: (_, e) => e.username,
					}),
					target: "validatingOtpUsername",
				},
			},
		},
		validatingOtpUsername: {
			entry: sendParent<OTPUsernameInputContext, AuthEvent>({
				type: "NETWORK_REQUEST.INITIALISED",
			}),
			invoke: {
				src: "validateUsername",
				onDone: {
					actions: assign<OTPUsernameInputContext, DoneInvokeEvent<User>>({
						userData: (_, e) => e.data,
						username: () => "",
					}),
					target: "validOtpUsername",
				},
				onError: {
					actions: assign<OTPUsernameInputContext, DoneInvokeEvent<unknown>>({
						username: () => "",
					}),
					target: "invalidOtpUsername",
				},
			},
		},
		invalidOtpUsername: {
			entry: sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthEvent),
			on: {
				"OTP_FLOW.SUBMIT_USERNAME": {
					actions: assign({ username: (_, e) => e.username }),
					target: "validatingOtpUsername",
				},
			},
		},
		validOtpUsername: {
			entry: [
				sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthEvent),
				sendParent({ type: "OTP_FLOW.USERNAME_VALIDATED" } as AuthEvent),
				sendParent((ctx) => ({ type: "GLOBAL_AUTH.NEW_USER_DATA", userData: ctx.userData })),
			],
			type: "final",
		},
	},
};

const otpUsernameInputOptions: MachineOptions<OTPUsernameInputContext, AuthEvent> = {
	actions: {},
	activities: {},
	delays: {},
	guards: {},
	services: {
		validateUsername: (): Promise<unknown> => {
			throw new Error("No service defined");
		},
	},
};

export function createOtpUsernameInputService(
	validateUsernameFn: (username: string) => Promise<User>
): StateMachine<OTPUsernameInputContext, OTPUsernameInputSchema, AuthEvent> {
	const machine = createMachine(otpUsernameInputConfig, otpUsernameInputOptions);
	return (machine as StateMachine<
		OTPUsernameInputContext,
		OTPUsernameInputSchema,
		AuthEvent
	>).withConfig({
		services: {
			validateUsername: (ctx) => validateUsernameFn(ctx.username),
		},
	});
}
