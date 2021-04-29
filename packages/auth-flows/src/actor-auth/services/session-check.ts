import {
	createMachine,
	DoneInvokeEvent,
	MachineConfig,
	MachineOptions,
	sendParent,
	StateMachine,
} from "xstate";

import type { AuthEvent, SessionCheckSchema } from "../types";

const sessionCheckConfig: MachineConfig<never, SessionCheckSchema, AuthEvent> = {
	initial: "checkingSession",
	states: {
		checkingSession: {
			entry: sendParent<never, AuthEvent>({ type: "NETWORK_REQUEST.INITIALISED" }),
			invoke: {
				src: "currentSession",
				onDone: {
					actions: sendParent<never, DoneInvokeEvent<unknown>, AuthEvent>({
						type: "GLOBAL_AUTH.ACTIVE_SESSION_PRESENT",
					}),
					target: "sessionCheckComplete",
				},
				onError: {
					actions: sendParent<never, DoneInvokeEvent<unknown>, AuthEvent>({
						type: "GLOBAL_AUTH.NO_ACTIVE_SESSION_PRESENT",
					}),
					target: "sessionCheckComplete",
				},
			},
		},
		sessionCheckComplete: {
			entry: sendParent<never, AuthEvent>({ type: "NETWORK_REQUEST.COMPLETE" }),
			type: "final",
		},
	},
};

const sessionCheckOptions: MachineOptions<never, AuthEvent> = {
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
): StateMachine<never, SessionCheckSchema, AuthEvent> {
	const machine = createMachine(sessionCheckConfig, sessionCheckOptions);
	return (machine as StateMachine<never, SessionCheckSchema, AuthEvent>).withConfig({
		services: {
			currentSession: () => currentSessionFn(),
		},
	});
}
