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
	AuthenticatorEvent,
	User,
	UsernamePasswordInputContext,
	UsernamePasswordInputSchema,
} from "../types";

const usernamePasswordInputConfig: MachineConfig<
	UsernamePasswordInputContext,
	UsernamePasswordInputSchema,
	AuthenticatorEvent
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
			entry: sendParent({ type: "NETWORK_REQUEST.INITIALISED" } as AuthenticatorEvent),
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
			entry: sendParent<UsernamePasswordInputContext, AuthenticatorEvent>({
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
				sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthenticatorEvent),
				sendParent(
					(ctx) =>
						({ type: "GLOBAL_AUTH.NEW_USER_DATA", userData: ctx.userData } as AuthenticatorEvent)
				),
				sendParent({ type: "USERNAME_PASSWORD_FLOW.VALIDATED" } as AuthenticatorEvent),
			],
			type: "final",
		},
	},
};

const usernamePasswordInputOptions: MachineOptions<
	UsernamePasswordInputContext,
	AuthenticatorEvent
> = {
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
): StateMachine<UsernamePasswordInputContext, UsernamePasswordInputSchema, AuthenticatorEvent> {
	const machine = createMachine(usernamePasswordInputConfig, usernamePasswordInputOptions);
	return (machine as StateMachine<
		UsernamePasswordInputContext,
		UsernamePasswordInputSchema,
		AuthenticatorEvent
	>).withConfig({
		services: {
			validateUsernamePassword: (ctx) => validateUsernamePasswordFn(ctx.username, ctx.password),
		},
	});
}
