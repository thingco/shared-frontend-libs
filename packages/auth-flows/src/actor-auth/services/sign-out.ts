import { createMachine, MachineConfig, MachineOptions, sendParent, StateMachine } from "xstate";

import { AuthEvent, SignOutSchema } from "../types";

const signOutServiceConfig: MachineConfig<never, SignOutSchema, AuthEvent> = {
	initial: "idle",
	states: {
		idle: {
			on: {
				"SIGN_OUT.INITIALISE": "signingOut",
			},
		},
		signingOut: {
			entry: sendParent({ type: "NETWORK_REQUEST.INITIALISED" } as AuthEvent),
			invoke: {
				src: "signOut",
				onDone: {
					target: "signedOut",
				},
			},
		},
		signedOut: {
			entry: [
				sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthEvent),
				sendParent({ type: "SIGN_OUT.COMPLETE" } as AuthEvent),
			],
			onDone: {
				target: "idle",
			},
		},
	},
};

const signOutServiceOptions: MachineOptions<never, AuthEvent> = {
	actions: {},
	activities: {},
	delays: {},
	guards: {},
	services: {
		signOut: (): Promise<unknown> => {
			throw new Error("No service defined");
		},
	},
};

export function createSignOutService(
	signOutFunction: () => Promise<unknown>
): StateMachine<never, SignOutSchema, AuthEvent> {
	const machine = createMachine(signOutServiceConfig, signOutServiceOptions);
	return (machine as StateMachine<never, SignOutSchema, AuthEvent>).withConfig({
		services: {
			signOut: () => signOutFunction(),
		},
	});
}
