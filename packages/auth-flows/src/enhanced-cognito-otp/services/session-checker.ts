/**
 * Handling of session check requests.
 *
 * NOTE that the actual session tokens (AWS Cognito returns three) are not, as things stand,
 * the responsibility of the auth machine. Amplify stores them in browser storage, and provides
 * functions to handle that. The auth machine is either authorised or it is not.
 *
 * @module
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
		checkingSession: StateNode;
	};
}

type SMEvent = NetworkReqEvent | NetworkReqCompleteEvent;

const sessionCheckConfig: MachineConfig<Context, Schema, SMEvent> = {
	id: "sessionCheckService",
	states: {
		checkingSession: {
			entry: sendParent<Context, SMEvent, NetworkReqEvent>({
				type: "NETWORK_REQUEST_IN_PROGRESS",
			}),
			invoke: {
				src: "checkSession",
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

const sessionCheckOptions: MachineOptions<Context, SMEvent> = {
	guards: {},
	actions: {},
	activities: {},
	services: {
		checkSession: (): Promise<unknown> => {
			throw new Error("No function provided for session check service");
		},
	},
	delays: {},
};

/**
 * A factory function for constructing a session checking service machine. Given a promise-returning
 * check function (in practice Amplify's `Auth.currentSession` method), configures and
 * defines a [sub] machine for use in the session checking stage of the Authenticator machine.
 *
 * @param checkSessionFn - promise-returning function that checks for active session
 * @returns
 */
export function createSessionCheckService<SessionType>(
	checkSessionFn: () => Promise<SessionType>
): StateMachine<Context, Schema, SMEvent> {
	const machine = createMachine(sessionCheckConfig, sessionCheckOptions);

	return (machine as StateMachine<Context, Schema, SMEvent>).withConfig({
		services: {
			checkSession: () => checkSessionFn(),
		},
	});
}
