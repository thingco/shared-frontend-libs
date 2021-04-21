/**
 * Handling of session checks.
 *
 */
import {
	createMachine,
	MachineConfig,
	MachineOptions,
	sendParent,
	StateMachine,
	StateNode,
} from "xstate";

import type { NetworkReqEvent, NetworkReqCompleteEvent } from "../types";

type Context = Record<string, never>;

interface Schema {
	states: {
		loggingOut: StateNode;
	};
}

type SMEvent = NetworkReqEvent | NetworkReqCompleteEvent;

export const logoutConfig: MachineConfig<Context, Schema, SMEvent> = {
	id: "logoutService",
	states: {
		loggingOut: {
			entry: sendParent<Context, SMEvent, NetworkReqEvent>({
				type: "NETWORK_REQUEST_IN_PROGRESS",
			}),
			invoke: {
				src: "logOut",
			},
			onDone: {
				actions: () =>
					sendParent<Context, SMEvent, NetworkReqCompleteEvent>({
						type: "NETWORK_REQUEST_COMPLETE",
					}),
			},
		},
	},
};

export const logoutOptions: MachineOptions<Context, SMEvent> = {
	guards: {},
	actions: {},
	activities: {},
	services: {
		logOut: (): Promise<null> => {
			throw new Error("No async function provided for logOut service");
		},
	},
	delays: {},
};

/**
 * factory function for constructing a log out service machine. Given a promise-returning
 * log out function (in practice Amplify's `Auth.signOut` method), configures and
 * defines a [sub] machine for use in the logout stage of the Authenticator machine.
 *
 * @param logOutFn - a promise-returning function that actions a browser logout
 * @returns
 */
export function createLogoutService(
	logOutFn: () => Promise<null>
): StateMachine<Context, Schema, SMEvent> {
	const machine = createMachine(logoutConfig, logoutOptions);

	return (machine as StateMachine<Context, Schema, SMEvent>).withConfig({
		services: {
			logOut: () => logOutFn(),
		},
	});
}
