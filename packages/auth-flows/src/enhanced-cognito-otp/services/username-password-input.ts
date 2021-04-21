/**
 * Username/password validation service.
 *
 * @remarks
 * This is quite primitive -- it simply takes input or a username and password,
 * stores them temporarily in the context, then attempts to validate, passing the resultant `user`
 * objcet back to the parent authenticator machine. It could be expanded to include things like
 * validating passwords as the user types etc. That could also be a case of YAGNI, so just
 * see how it goes.
 */
import {
	assign,
	createMachine,
	MachineConfig,
	MachineOptions,
	sendParent,
	StateMachine,
	StateNode,
} from "xstate";

import { NetworkReqCompleteEvent, NetworkReqEvent, UserDetailsReceivedEvent } from "../types";

interface Context<UserType> {
	username: string;
	password: string;
	user: UserType | null;
}

interface Schema {
	states: {
		awaitingInput: StateNode;
		validatingInput: StateNode;
		validInput: StateNode;
	};
}

type SubmitUsernameAndPasswordEvent = {
	type: "SUBMIT_USERNAME_AND_PASSWORD";
	data: { username: string; password: string };
};

type SMEvent<UserType> =
	| NetworkReqEvent
	| NetworkReqCompleteEvent
	| SubmitUsernameAndPasswordEvent
	| UserDetailsReceivedEvent<UserType>;

/**
 * NOTE the configuration in this case is defined as a function: the generic `UserType`
 * needs to be passed into the machine's factory function.
 *
 * @returns
 */
function usernamePasswordInputConfig<UserType>(): MachineConfig<
	Context<UserType>,
	Schema,
	SMEvent<UserType>
> {
	return {
		id: "usernamePasswordInput",
		initial: "awaitingInput",
		context: {
			username: "",
			password: "",
			user: null,
		},
		states: {
			awaitingInput: {
				on: {
					SUBMIT_USERNAME_AND_PASSWORD: {
						actions: assign({
							username: (_, e) => e.data.username || "",
							password: (_, e) => e.data.password || "",
						}),
						target: "validatingInput",
					},
				},
			},
			validatingInput: {
				entry: sendParent<Context<UserType>, SMEvent<UserType>, NetworkReqEvent>({
					type: "NETWORK_REQUEST_IN_PROGRESS",
				}),
				invoke: {
					id: "usernameAndPasswordCheck",
					src: "validateUsernameAndPassword",
					onDone: {
						target: "validInput",
						actions: (_, e) =>
							sendParent<Context<UserType>, SMEvent<UserType>, UserDetailsReceivedEvent<UserType>>({
								type: "USER_DETAILS_RECEIVED",
								data: e.data,
							}),
					},
					onError: {
						target: "awaitingInput",
						actions: () => assign({ username: "", password: "" }),
					},
				},
				onDone: {
					actions: () =>
						sendParent<Context<UserType>, SMEvent<UserType>, NetworkReqCompleteEvent>({
							type: "NETWORK_REQUEST_COMPLETE",
						}),
				},
			},
			validInput: {
				type: "final",
			},
		},
	};
}

/**
 *
 * @remarks
 * NOTE the options object in this case is defined as a function: the generic `UserType`
 * needs to be passed into the machine's factory function.
 * NOTE that any options that are NOT configurable (_ie_ they are internal to the machine)
 * are all defined inline. The problem with `MachineOptions` is that anything defined on
 * it can appear _anywhere_ in the machine config. Therefore type inference fails for actions
 * in particular: because the events are a discriminated union, TS infers that any action that
 * uses an event is incorrectly defined.
 */
function usernamePasswordInputOptions<UserType>(): MachineOptions<
	Context<UserType>,
	SMEvent<UserType>
> {
	return {
		actions: {},
		activities: {},
		delays: {},
		guards: {},
		services: {
			validateUsernameAndPassword: (): Promise<UserType> => {
				throw new Error("No async function provided for validateUsername service");
			},
		},
	};
}

/**
 * A factory function for constructing a username & password input service machine. Given a
 * promise-returning validation function (in practice Amplify's `Auth.signIn` method), configures and
 * defines a [sub] machine for use in the username/password validation stage of the Authenticator machine.
 *
 * @param validateUsernameAndPasswordFn - The validation function to be passed through to the resultant machine
 * @returns a machine to handle username/password input & validation
 */
export function createUsernameAndPasswordInputService<UserType>(
	validateUsernameAndPasswordFn: (username: string, password: string) => Promise<UserType>
): StateMachine<Context<UserType>, Schema, SMEvent<UserType>> {
	const machine = createMachine(usernamePasswordInputConfig(), usernamePasswordInputOptions());

	return (machine as StateMachine<Context<UserType>, Schema, SMEvent<UserType>>).withConfig({
		services: {
			validateUsernameAndPassword: (ctx) =>
				validateUsernameAndPasswordFn(ctx.username, ctx.password),
		},
	});
}
