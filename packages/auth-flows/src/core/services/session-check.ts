import {
	createMachine,
	DoneInvokeEvent,
	MachineConfig,
	MachineOptions,
	sendParent,
	StateMachine,
} from "xstate";

import type { AuthenticatorEvent, SessionCheckSchema } from "../types";

const sessionCheckConfig: MachineConfig<never, SessionCheckSchema, AuthenticatorEvent> = {
	initial: "checkingSession",
	states: {
		checkingSession: {
			entry: sendParent<never, AuthenticatorEvent>({ type: "NETWORK_REQUEST.INITIALISED" }),
			invoke: {
				src: "currentSession",
				onDone: {
					actions: sendParent<never, DoneInvokeEvent<unknown>, AuthenticatorEvent>({
						type: "GLOBAL_AUTH.ACTIVE_SESSION_PRESENT",
					}),
					target: "sessionCheckComplete",
				},
				onError: {
					actions: sendParent<never, DoneInvokeEvent<unknown>, AuthenticatorEvent>({
						type: "GLOBAL_AUTH.NO_ACTIVE_SESSION_PRESENT",
					}),
					target: "sessionCheckComplete",
				},
			},
		},
		sessionCheckComplete: {
			entry: sendParent<never, AuthenticatorEvent>({ type: "NETWORK_REQUEST.COMPLETE" }),
			type: "final",
		},
	},
};

const sessionCheckOptions: MachineOptions<never, AuthenticatorEvent> = {
	actions: {},
	activities: {},
	delays: {},
	guards: {},
	services: {
		currentSession: (): Promise<unknown> => {
			throw new Error("No service defined");
		},
	},
};

export function createSessionCheckService(
	currentSessionFn: () => Promise<unknown>
): StateMachine<never, SessionCheckSchema, AuthenticatorEvent> {
	const machine = createMachine(sessionCheckConfig, sessionCheckOptions);
	return (machine as StateMachine<never, SessionCheckSchema, AuthenticatorEvent>).withConfig({
		services: {
			currentSession: () => currentSessionFn(),
		},
	});
}
