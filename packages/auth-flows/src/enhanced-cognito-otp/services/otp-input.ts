/**
 * Handling of OTP input and validation.
 *
 * Note that this machine needs to have the `user` context value passed into on invocation
 *
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

import {
	AuthenticatorEvents,
	NetworkReqCompleteEvent,
	NetworkReqEvent,
	OTPRetriesExceededEvent,
	UserDetailsReceivedEvent,
} from "../types";

interface Context<UserType> {
	otp: string;
	retriesRemaining: number;
	user: UserType | null;
}

interface Schema {
	states: {
		awaitingInput: StateNode;
		validatingInput: StateNode;
		invalidOtp: StateNode;
		validOtp: StateNode;
	};
}

/**
 *
 * @returns
 *
 * @remarks
 * NOTE the configuration in this case is defined as a function: the generic `UserType`
 * needs to be passed into the machine's factory function.
 *
 */
function otpInputConfig<UserType>(): MachineConfig<
	Context<UserType>,
	Schema,
	AuthenticatorEvents<UserType>
> {
	return {
		id: "otpInput",
		initial: "awaitingInput",
		context: {
			otp: "",
			retriesRemaining: 2,
			user: null,
		},
		states: {
			awaitingInput: {
				on: {
					SUBMIT_OTP: {
						actions: assign({
							otp: (_, e) => e.data || "",
						}),
						target: "validatingInput",
					},
				},
			},
			validatingInput: {
				entry: sendParent<Context<UserType>, AuthenticatorEvents<UserType>, NetworkReqEvent>({
					type: "NETWORK_REQUEST_IN_PROGRESS",
				}),
				invoke: {
					id: "passwordCheck",
					src: "validateOtp",
					onDone: {
						target: "validPassword",
					},
					onError: [
						{
							target: "invalidPassword",
							cond: (ctx) => ctx.retriesRemaining > 0,
							actions: (ctx) =>
								assign({
									otp: "",
									retriesRemaining: ctx.retriesRemaining - 1,
								}),
						},
						{
							actions: () =>
								sendParent<
									Context<UserType>,
									AuthenticatorEvents<UserType>,
									OTPRetriesExceededEvent
								>({
									type: "OTP_RETRIES_EXCEEDED",
								}),
						},
					],
				},
				onDone: {
					actions: [
						(_, e) =>
							sendParent<
								Context<UserType>,
								AuthenticatorEvents<UserType>,
								UserDetailsReceivedEvent<UserType>
							>({
								type: "USER_DETAILS_RECEIVED",
								data: e.data,
							}),
						() =>
							sendParent<Context<UserType>, AuthenticatorEvents<UserType>, NetworkReqCompleteEvent>(
								{
									type: "NETWORK_REQUEST_COMPLETE",
								}
							),
					],
				},
			},
			invalidOtp: {
				on: {
					SUBMIT_OTP: {
						actions: assign({
							otp: (_, e) => e.data || "",
						}),
						target: "validatingInput",
					},
				},
			},
			validOtp: {
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
 *
 * @returns
 */
function otpInputOptions<UserType>(): MachineOptions<
	Context<UserType>,
	AuthenticatorEvents<UserType>
> {
	return {
		actions: {},
		activities: {},
		delays: {},
		guards: {},
		services: {
			validateOtp: (): Promise<unknown> => {
				throw new Error("No async function provided for validateOtp service");
			},
		},
	};
}

/**
 * A factory function for constructing an OTP input service machine. Given a promise-returning
 * validation function (in practice Amplify's `Auth.sendCustomChallengeAnswer` method) plus the
 * number of attempts at entering their OTP a user is allowed (recommended default is 3), configures and
 * defines a [sub] machine for use in the OTP validation stage of the Authenticator machine.
 *
 * @param validateOtpFn - The validation function to be passed through to the resultant machine
 * @param allowedRetries - how many tries a user has at entering the OTP before they get bumped back to username input
 * @returns
 */
export function createOtpInputService<UserType>(
	validateOtpFn: (user: UserType, otp: string) => Promise<unknown>,
	allowedRetries: number
): StateMachine<Context<UserType>, Schema, AuthenticatorEvents<UserType>> {
	const machine = createMachine(otpInputConfig<UserType>(), otpInputOptions<UserType>());

	return (machine as StateMachine<
		Context<UserType>,
		Schema,
		AuthenticatorEvents<UserType>
	>).withConfig(
		{
			services: {
				validateOtp: (ctx) => {
					if (!ctx.user) {
						throw new Error(
							"A user object must be passed as the first argument to the validateOtp function. The user object field is currently null, so that function will fail."
						);
					}
					return validateOtpFn(ctx.user, ctx.otp);
				},
			},
		},
		{ ...(machine.context as Context<UserType>), retriesRemaining: allowedRetries }
	);
}
