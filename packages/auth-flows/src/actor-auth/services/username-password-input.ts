import {
	assign,
	createMachine,
	DoneInvokeEvent,
	MachineConfig,
	MachineOptions,
	sendParent,
	StateMachine,
} from "xstate";

import type {
	AuthEvent,
	User,
	UsernamePasswordInputContext,
	UsernamePasswordInputSchema,
} from "../types";

const usernamePasswordInputConfig: MachineConfig<
	UsernamePasswordInputContext,
	UsernamePasswordInputSchema,
	AuthEvent
> = {
	id: "usernameInput",
	initial: "awaitingUsernamePassword",
	context: {
		username: "",
		password: "",
		userData: null,
	},
	states: {
		awaitingUsernamePassword: {
			on: {
				"USERNAME_PASSWORD_FLOW.INPUT": {
					actions: assign({
						username: (_, e) => e.username,
						password: (_, e) => e.password,
					}),
					target: "validatingUsernamePassword",
				},
			},
		},
		validatingUsernamePassword: {
			entry: sendParent({ type: "NETWORK_REQUEST.INITIALISED" } as AuthEvent),
			invoke: {
				src: "validateUsernamePassword",
				onDone: {
					actions: assign<UsernamePasswordInputContext, DoneInvokeEvent<{ data: User }>>({
						userData: (ctx, e) => e.data,
						username: () => "",
						password: () => "",
					}),
					target: "validUsernamePassword",
				},
				onError: {
					actions: assign<UsernamePasswordInputContext, DoneInvokeEvent<unknown>>({
						username: () => "",
						password: () => "",
					}),
					target: "invalidUsernamePassword",
				},
			},
		},
		invalidUsernamePassword: {
			entry: sendParent<UsernamePasswordInputContext, AuthEvent>({
				type: "NETWORK_REQUEST.COMPLETE",
			}),
			on: {
				"USERNAME_PASSWORD_FLOW.INPUT": {
					actions: assign({ username: (_, e) => e.username, password: (_, e) => e.password }),
					target: "validatingUsernamePassword",
				},
			},
		},
		validUsernamePassword: {
			entry: [
				sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthEvent),
				sendParent(
					(ctx) => ({ type: "GLOBAL_AUTH.NEW_USER_DATA", userData: ctx.userData } as AuthEvent)
				),
				sendParent({ type: "USERNAME_PASSWORD_FLOW.VALIDATED" } as AuthEvent),
			],
			type: "final",
		},
	},
};

const usernamePasswordInputOptions: MachineOptions<UsernamePasswordInputContext, AuthEvent> = {
	actions: {},
	activities: {},
	delays: {},
	guards: {},
	services: {
		validateUsernamePassword: (): Promise<unknown> => {
			throw new Error("No service defined");
		},
	},
};

export function createUsernamePasswordInputService(
	validateUsernamePasswordFn: (username: string, password: string) => Promise<User>
): StateMachine<UsernamePasswordInputContext, UsernamePasswordInputSchema, AuthEvent> {
	const machine = createMachine(usernamePasswordInputConfig, usernamePasswordInputOptions);
	return (machine as StateMachine<
		UsernamePasswordInputContext,
		UsernamePasswordInputSchema,
		AuthEvent
	>).withConfig({
		services: {
			validateUsernamePassword: (ctx) => validateUsernamePasswordFn(ctx.username, ctx.password),
		},
	});
}
