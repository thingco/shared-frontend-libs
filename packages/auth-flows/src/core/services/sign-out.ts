import { createMachine, MachineConfig, MachineOptions, sendParent, StateMachine } from "xstate";

import { AuthenticatorEvent, SignOutSchema } from "../types";

const signOutServiceConfig: MachineConfig<never, SignOutSchema, AuthenticatorEvent> = {
	initial: "idle",
	states: {
		idle: {
			on: {
				"SIGN_OUT.INITIALISE": "signingOut",
			},
		},
		signingOut: {
			entry: sendParent({ type: "NETWORK_REQUEST.INITIALISED" } as AuthenticatorEvent),
			invoke: {
				src: "signOut",
				onDone: {
					target: "signedOut",
				},
			},
		},
		signedOut: {
			entry: [
				sendParent({ type: "NETWORK_REQUEST.COMPLETE" } as AuthenticatorEvent),
				sendParent({ type: "SIGN_OUT.COMPLETE" } as AuthenticatorEvent),
			],
			onDone: {
				target: "idle",
			},
		},
	},
};

const signOutServiceOptions: MachineOptions<never, AuthenticatorEvent> = {
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
): StateMachine<never, SignOutSchema, AuthenticatorEvent> {
	const machine = createMachine(signOutServiceConfig, signOutServiceOptions);
	return (machine as StateMachine<never, SignOutSchema, AuthenticatorEvent>).withConfig({
		services: {
			signOut: () => signOutFunction(),
		},
	});
}
