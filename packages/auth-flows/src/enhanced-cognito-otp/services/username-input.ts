/**
 * Handling of OTP input and validation.
 *
 * Note that this machine needs to have the `user` context value passed into on invocation
 *
 */
import {
	assign,
	createMachine,
	DoneInvokeEvent,
	MachineConfig,
	MachineOptions,
	sendParent,
	StateMachine,
	StateNode,
} from "xstate";

import { NetworkReqCompleteEvent, NetworkReqEvent, UserDetailsReceivedEvent } from "../types";

interface Context {
	username: string;
}

interface Schema {
	states: {
		awaitingInput: StateNode;
		validatingInput: StateNode;
		invalidUsername: StateNode;
		passwordRetriesExceeded: StateNode;
		validUsername: StateNode;
	};
}

type SubmitUsernameEvent = { type: "SUBMIT_USERNAME"; data: string };

type SMEvent<UserType> =
	| SubmitUsernameEvent
	| NetworkReqEvent
	| NetworkReqCompleteEvent
	| UserDetailsReceivedEvent<UserType>;

function usernameInputConfig<UserType>(): MachineConfig<Context, Schema, SMEvent<UserType>> {
	return {
		id: "usernameInput",
		initial: "awaitingInput",
		context: {
			username: "",
		},
		states: {
			awaitingInput: {
				on: {
					SUBMIT_USERNAME: {
						actions: assign({
							username: (_, e) => e.data || "",
						}),
						target: "validatingInput",
					},
				},
			},
			validatingInput: {
				entry: sendParent<Context, SMEvent<UserType>, NetworkReqEvent>({
					type: "NETWORK_REQUEST_IN_PROGRESS",
				}),
				invoke: {
					id: "usernameCheck",
					src: "validateUsername",
					onDone: {
						target: "validUsername",
						actions: (ctx, e) =>
							sendParent<Context, SMEvent<UserType>, UserDetailsReceivedEvent<UserType>>({
								type: "USER_DETAILS_RECEIVED",
								data: e.data,
							}),
					},
					onError: {
						target: "invalidUsername",
						actions: () => assign<Context, DoneInvokeEvent<unknown>>({ username: "" }),
					},
				},
				onDone: {
					actions: () =>
						sendParent<Context, SMEvent<UserType>, NetworkReqCompleteEvent>({
							type: "NETWORK_REQUEST_COMPLETE",
						}),
				},
			},
			invalidUsername: {
				on: {
					SUBMIT_USERNAME: {
						actions: assign({
							username: (_, e) => e.data || "",
						}),
						target: "validatingInput",
					},
				},
			},
			passwordRetriesExceeded: {
				on: {
					SUBMIT_USERNAME: {
						actions: assign({
							username: (_, e) => e.data || "",
						}),
						target: "validatingInput",
					},
				},
			},
			validUsername: {
				type: "final",
			},
		},
	};
}

// NOTE that any options that are NOT configurable (_ie_ they are internal to the machine)
// are all defined inline. The problem with `MachineOptions` is that anything defined on
// it can appear _anywhere_ in the machine config. Therefore type inference fails for actions
// in particular: because the events are a discriminated union, TS infers that any action that
// uses an event is incorrectly defined.
function usernameInputOptions<UserType>(): MachineOptions<Context, SMEvent<UserType>> {
	return {
		actions: {},
		activities: {},
		delays: {},
		guards: {},
		services: {
			validateUsername: (): Promise<unknown> => {
				throw new Error("No async function provided for validateUsername service");
			},
		},
	};
}

/**
 * A factory function for constructing a username input service machine. Given a promise-returning
 * validation function (in practice Amplify's `Auth.signIn` method), configures and
 * defines a [sub] machine for use in the username validation stage of the Authenticator machine.
 *
 * @param validateUsernameFn - The validation function to be passed through to the resultant machine
 * @returns
 */
export function createUsernameInputService<UserType>(
	validateUsernameFn: (username: string) => Promise<UserType>
): StateMachine<Context, Schema, SMEvent<UserType>> {
	// Construct the machine...
	const machine = createMachine(usernameInputConfig(), usernameInputOptions());
	// ...then assign whatever the validateUsername function is to the service.
	// This will be Amplify's `Auth.signIn` function in practice, but this allows
	// for mock functionality to be sent into the machine.
	return (machine as StateMachine<Context, Schema, SMEvent<UserType>>).withConfig({
		services: {
			validateUsername: (ctx) => validateUsernameFn(ctx.username),
		},
	});
}
