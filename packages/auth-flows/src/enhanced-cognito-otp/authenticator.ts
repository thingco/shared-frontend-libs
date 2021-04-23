import {
	assign,
	DoneInvokeEvent,
	Machine,
	MachineConfig,
	MachineOptions,
	StateMachine,
} from "xstate";

import { AuthAction, AuthCond, AuthEventType, AuthServices, AuthState, AuthStateId } from "./enums";
import {
	AuthContext,
	AuthEvent,
	AuthSchema,
	AuthServiceFunctions,
	SubmitOTPEvent,
	SubmitUsernameAndPasswordEvent,
	SubmitUsernameEvent,
} from "./types";

/**
 * Enhanced Cognito-OTP-based authentication flow.
 *
 * Instead of the basic Cognito OTP authenticator, this one is divided into
 * stages, each with their own machinery.
 *
 */
function authenticatorConfig<UserType>(): MachineConfig<
	AuthContext<UserType>,
	AuthSchema,
	AuthEvent<UserType>
> {
	return {
		id: AuthStateId.Authenticator,
		context: {
			isLoading: false,
			otpRetriesAllowed: 3,
			otpRetriesRemaining: 3,
			useOtpAuth: true,
			user: null,
			username: "",
			password: "",
		},
		states: {
			[AuthState.CheckingSession]: {
				entry: AuthAction.NetworkReqStarted,
				invoke: {
					src: "checkSession",
					onDone: {
						target: AuthState.Authorised,
					},
					onError: [
						{
							cond: AuthCond.IsUsingOTPAuth,
							target: AuthState.UsernameInput,
						},
						{
							target: AuthState.UsernamePasswordInput,
						},
					],
				},
				onDone: {
					actions: AuthAction.NetworkReqComplete,
				},
			},
			[AuthState.UsernameInput]: {
				initial: AuthState.AwaitingUsernameInput,
				states: {
					[AuthState.AwaitingUsernameInput]: {
						on: {
							[AuthEventType.SUBMIT_USERNAME]: {
								actions: AuthAction.SetUsername,
								target: AuthState.ValidatingUsernameInput,
							},
						},
					},
					[AuthState.ValidatingUsernameInput]: {
						entry: AuthAction.NetworkReqStarted,
						invoke: {
							src: "validateUsername",
							onDone: {
								target: AuthState.ValidUsername,
								actions: AuthAction.SetUser,
							},
							onError: {
								target: AuthState.InvalidUsername,
								actions: AuthAction.ClearUsername,
							},
						},
						onDone: {
							actions: AuthAction.NetworkReqComplete,
						},
					},
					[AuthState.InvalidUsername]: {
						on: {
							[AuthEventType.SUBMIT_USERNAME]: {
								actions: AuthAction.SetUsername,
								target: AuthState.ValidatingUsernameInput,
							},
						},
					},
					[AuthState.PasswordRetriesExceeded]: {
						id: AuthStateId.PasswordRetriesExceeded,
						on: {
							[AuthEventType.SUBMIT_USERNAME]: {
								actions: AuthAction.SetUsername,
								target: AuthState.ValidatingUsernameInput,
							},
						},
					},
					[AuthState.ValidUsername]: {
						type: "final",
					},
				},
			},
			[AuthState.OTPInput]: {
				initial: AuthState.AwaitingOtpInput,
				states: {
					[AuthState.AwaitingOtpInput]: {
						on: {
							[AuthEventType.SUBMIT_OTP]: {
								actions: AuthAction.SetPassword,
								target: AuthState.ValidatingOtpInput,
							},
						},
					},
					[AuthState.ValidatingOtpInput]: {
						entry: AuthAction.NetworkReqStarted,
						invoke: {
							src: "validateOtp",
							onDone: {
								target: AuthState.ValidOtp,
								actions: AuthAction.SetUser,
							},
							onError: [
								{
									target: AuthState.InvalidOtp,
									cond: AuthCond.HasRetriesRemaining,
									actions: [AuthAction.ClearPassword, AuthAction.DecrementRetries],
								},
								{
									target: `#${AuthStateId.PasswordRetriesExceeded}`,
									actions: [AuthAction.ClearPassword, AuthAction.ResetRetries],
								},
							],
						},
						onDone: {
							actions: AuthAction.NetworkReqComplete,
						},
					},
					[AuthState.InvalidOtp]: {
						on: {
							[AuthEventType.SUBMIT_OTP]: {
								actions: AuthAction.SetPassword,
								target: AuthState.AwaitingOtpInput,
							},
						},
					},
					[AuthState.ValidOtp]: {
						type: "final",
					},
				},
			},
			[AuthState.UsernamePasswordInput]: {
				initial: AuthState.AwaitingUsernamePasswordInput,
				states: {
					[AuthState.AwaitingUsernamePasswordInput]: {
						on: {
							[AuthEventType.SUBMIT_USERNAME_AND_PASSWORD]: {
								actions: AuthAction.SetUsernamePassword,
								target: AuthState.ValidatingUsernamePasswordInput,
							},
						},
					},
					[AuthState.ValidatingUsernamePasswordInput]: {
						entry: AuthAction.NetworkReqStarted,
						invoke: {
							src: "validateUsernameAndPassword",
							onDone: {
								target: AuthState.ValidUsernamePasswordInput,
								actions: AuthAction.SetUser,
							},
							onError: {
								target: AuthState.InvalidUsernamePasswordInput,
								actions: AuthAction.ClearUsernamePassword,
							},
						},
						onDone: {
							actions: AuthAction.NetworkReqComplete,
						},
					},
					[AuthState.ValidUsernamePasswordInput]: {
						type: "final",
					},
					[AuthState.InvalidUsernamePasswordInput]: {
						on: {
							[AuthEventType.SUBMIT_USERNAME_AND_PASSWORD]: {
								actions: AuthAction.SetUsernamePassword,
								target: AuthState.ValidatingUsernamePasswordInput,
							},
						},
					},
				},
			},
			[AuthState.Authorised]: {
				on: {
					[AuthEventType.LOG_OUT]: AuthState.LoggingOut,
				},
			},
			[AuthState.LoggingOut]: {
				entry: AuthAction.NetworkReqStarted,
				invoke: {
					src: "signOut",
					onDone: {
						target: AuthState.CheckingSession,
					},
				},
				onDone: {
					actions: AuthAction.NetworkReqComplete,
				},
			},
		},
	};
}

function authenticatorOptions<UserType>(): MachineOptions<
	AuthContext<UserType>,
	AuthEvent<UserType>
> {
	return {
		actions: {
			[AuthAction.NetworkReqStarted]: () => assign({ isLoading: true }),
			[AuthAction.NetworkReqComplete]: () => assign({ isLoading: false }),
			[AuthAction.ClearPassword]: () => assign({ password: "" }),
			[AuthAction.SetPassword]: (_, e) => assign({ password: (e as SubmitOTPEvent).data }),
			[AuthAction.SetUser]: (_, e) =>
				assign({ user: (e as DoneInvokeEvent<{ data: UserType }>).data }),
			[AuthAction.SetUsername]: (_, e) => assign({ username: (e as SubmitUsernameEvent).data }),
			[AuthAction.SetUsernamePassword]: (_, e) =>
				assign({
					username: (e as SubmitUsernameAndPasswordEvent).data.username,
					password: (e as SubmitUsernameAndPasswordEvent).data.password,
				}),
			[AuthAction.DecrementRetries]: (ctx) =>
				assign({ otpRetriesRemaining: ctx.otpRetriesRemaining - 1 }),
			[AuthAction.ResetRetries]: (ctx) => assign({ otpRetriesRemaining: ctx.otpRetriesAllowed }),
		},
		activities: {},
		delays: {},
		guards: {
			[AuthCond.HasRetriesRemaining]: (ctx) => ctx.otpRetriesRemaining > 0,
			[AuthCond.IsUsingOTPAuth]: (ctx) => ctx.useOtpAuth,
		},
		services: {
			[AuthServices.currentSession]: () => {
				throw new Error("No session check service defined");
			},
			[AuthServices.validateUsernameAndPassword]: () => {
				throw new Error("No username/password validaiton service defined");
			},
			[AuthServices.validateUsername]: () => {
				throw new Error("No username validation service defined");
			},
			[AuthServices.validateOtp]: () => {
				throw new Error("No OTP validation service defined");
			},
			[AuthServices.signOut]: () => {
				throw new Error("No sign out service defined");
			},
		},
	};
}

export type AuthenticatorConfig<UserType, SessionType> = {
	authFunctions: AuthServiceFunctions<UserType, SessionType>;
	useOtpAuth?: boolean;
	allowedOtpAttempts?: number;
};

export function createAuthenticator<UserType, SessionType>(
	authConfig: AuthenticatorConfig<UserType, SessionType>
): StateMachine<AuthContext<UserType>, AuthSchema, AuthEvent<UserType>> {
	const machine = Machine(authenticatorConfig(), authenticatorOptions());

	return (machine as StateMachine<
		AuthContext<UserType>,
		AuthSchema,
		AuthEvent<UserType>
	>).withConfig({
		services: {
			[AuthServices.currentSession]: () => authConfig.authFunctions.currentSession(),
			[AuthServices.validateUsernameAndPassword]: (ctx) =>
				authConfig.authFunctions.validateUsernameAndPassword(ctx.username, ctx.password),
			[AuthServices.validateUsername]: (ctx) =>
				authConfig.authFunctions.validateUsername(ctx.username),
			[AuthServices.validateOtp]: (ctx) => {
				if (ctx.user === null)
					throw new Error(
						"To validate the OTP, a user object must be passed in. The user object is currently null, so this will not work."
					);
				return authConfig.authFunctions.validateOtp(ctx.user, ctx.password);
			},
			[AuthServices.signOut]: () => authConfig.authFunctions.signOut,
		},
	});
}
