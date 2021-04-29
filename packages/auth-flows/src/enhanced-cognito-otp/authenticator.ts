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
	SubmitPINConfirmationEvent,
	SubmitPINEvent,
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
			usePinSecurity: true,
			pinSecurityActive: false,
			pinRetriesAllowed: 3,
			pinRetriesRemaining: 3,
			user: null,
			username: "",
			password: "",
			pin: "",
		},
		initial: AuthState.CheckingSession,
		states: {
			[AuthState.CheckingSession]: {
				id: AuthStateId.CheckingSession,
				entry: AuthAction.NetworkReqStarted,
				invoke: {
					src: AuthServices.currentSession,
					onDone: [
						{
							target: AuthState.PINInput,
							cond: AuthCond.IsUsingPINSecurity,
							actions: AuthAction.NetworkReqComplete,
						},
						{
							target: AuthState.Authorised,
							actions: AuthAction.NetworkReqComplete,
						},
					],
					onError: [
						{
							cond: AuthCond.IsUsingOTPAuth,
							target: AuthState.UsernameInput,
							actions: AuthAction.NetworkReqComplete,
						},
						{
							target: AuthState.UsernamePasswordInput,
							actions: AuthAction.NetworkReqComplete,
						},
					],
				},
			},
			[AuthState.UsernameInput]: {
				id: AuthStateId.UsernameInput,
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
							src: AuthServices.validateUsername,
							onDone: {
								target: `#${AuthStateId.OTPInput}`,
								actions: [AuthAction.NetworkReqComplete, AuthAction.SetUser],
							},
							onError: {
								target: AuthState.InvalidUsername,
								actions: [AuthAction.NetworkReqComplete, AuthAction.ClearUsername],
							},
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
				},
			},
			[AuthState.OTPInput]: {
				id: AuthStateId.OTPInput,
				initial: AuthState.AwaitingOtpInput,
				states: {
					[AuthState.AwaitingOtpInput]: {
						on: {
							[AuthEventType.SUBMIT_OTP]: {
								actions: AuthAction.SetPassword,
								target: AuthState.ValidatingOtpInput,
							},
							[AuthEventType.GO_BACK]: {
								target: `#${AuthStateId.UsernameInput}`,
							},
						},
					},
					[AuthState.ValidatingOtpInput]: {
						entry: AuthAction.NetworkReqStarted,
						invoke: {
							src: AuthServices.validateUsername,
							onDone: [
								{
									target: `#${AuthStateId.PINInput}`,
									cond: AuthCond.IsUsingPINSecurity,
									actions: [AuthAction.NetworkReqComplete, AuthAction.SetUser],
								},
								{
									target: `#${AuthStateId.Authorised}`,
									actions: [AuthAction.NetworkReqComplete, AuthAction.SetUser],
								},
							],
							onError: [
								{
									target: AuthState.InvalidOtp,
									cond: AuthCond.HasRetriesRemaining,
									actions: [
										AuthAction.NetworkReqComplete,
										AuthAction.ClearPassword,
										AuthAction.DecrementRetries,
									],
								},
								{
									target: `#${AuthStateId.PasswordRetriesExceeded}`,
									actions: [
										AuthAction.NetworkReqComplete,
										AuthAction.ClearPassword,
										AuthAction.ResetRetries,
									],
								},
							],
						},
					},
					[AuthState.InvalidOtp]: {
						on: {
							[AuthEventType.SUBMIT_OTP]: {
								actions: AuthAction.SetPassword,
								target: AuthState.AwaitingOtpInput,
							},
							[AuthEventType.GO_BACK]: {
								target: `#${AuthStateId.UsernameInput}`,
							},
						},
					},
				},
			},
			[AuthState.UsernamePasswordInput]: {
				id: AuthStateId.UsernamePasswordInput,
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
							src: AuthServices.validateUsernameAndPassword,
							onDone: [
								{
									target: `#${AuthStateId.PINInput}`,
									cond: AuthCond.IsUsingPINSecurity,
									actions: [AuthAction.NetworkReqComplete, AuthAction.SetUser],
								},
								{
									target: `#${AuthStateId.Authorised}`,
									actions: [AuthAction.NetworkReqComplete, AuthAction.SetUser],
								},
							],
							onError: {
								target: AuthState.InvalidUsernamePasswordInput,
								actions: [AuthAction.NetworkReqComplete, AuthAction.ClearUsernamePassword],
							},
						},
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
			[AuthState.PINInput]: {
				id: AuthStateId.PINInput,
				initial: AuthState.PINInputInit,
				states: {
					[AuthState.PINInputInit]: {
						entry: AuthAction.NetworkReqStarted,
						invoke: {
							src: AuthServices.checkHasPINSet,
							onDone: {
								actions: [AuthAction.ActivatePINSecurity, AuthAction.NetworkReqComplete],
								target: AuthState.AwaitingPINInput,
							},
							onError: {
								actions: AuthAction.NetworkReqComplete,
								target: AuthState.AwaitingNewPINInput,
							},
						},
					},
					[AuthState.PINRevocationInit]: {
						id: AuthStateId.PINRevocation,
						entry: AuthAction.NetworkReqStarted,
						invoke: {
							src: AuthServices.revokePIN,
							onDone: {
								actions: [AuthAction.NetworkReqComplete, AuthAction.DeactivatePINSecurity],
								target: AuthState.AwaitingNewPINInput,
							},
						},
					},
					[AuthState.AwaitingPINInput]: {
						entry: AuthAction.ClearPIN,
						on: {
							[AuthEventType.GO_BACK]: `#${AuthStateId.UsernameInput}`,
							[AuthEventType.SUBMIT_PIN]: {
								actions: AuthAction.SetPIN,
								target: AuthState.ValidatingPINInput,
							},
						},
					},
					[AuthState.AwaitingNewPINInput]: {
						entry: AuthAction.ClearPIN,
						on: {
							[AuthEventType.SUBMIT_PIN]: {
								actions: AuthAction.SetPIN,
								target: AuthState.AwaitingNewPINConfirmationInput,
							},
							[AuthEventType.SKIP_PIN]: {
								target: `#${AuthStateId.Authorised}`,
							},
						},
					},
					[AuthState.AwaitingNewPINConfirmationInput]: {
						on: {
							[AuthEventType.GO_BACK]: `#${AuthStateId.UsernameInput}`,
							[AuthEventType.SUBMIT_PIN_CONFIRMATION]: [
								{
									cond: AuthCond.NewPINMatches,
									target: AuthState.SettingNewPIN,
								},
								{
									target: AuthState.AwaitingNewPINConfirmationInput,
								},
							],
						},
					},
					[AuthState.SettingNewPIN]: {
						entry: AuthAction.NetworkReqStarted,
						invoke: {
							src: AuthServices.setNewPIN,
							onDone: {
								target: `#${AuthStateId.Authorised}`,
								actions: [
									AuthAction.NetworkReqComplete,
									AuthAction.ActivatePINSecurity,
									AuthAction.ClearPIN,
								],
							},
							// TODO add error handling
						},
					},
					[AuthState.ValidatingPINInput]: {
						entry: AuthAction.NetworkReqStarted,
						invoke: {
							src: AuthServices.validatePIN,
							onDone: {
								target: `#${AuthStateId.Authorised}`,
								actions: [AuthAction.NetworkReqComplete, AuthAction.ClearPIN],
							},
							onError: {
								target: AuthState.InvalidPIN,
								actions: [AuthAction.NetworkReqComplete, AuthAction.ClearPIN],
							},
						},
					},
					[AuthState.InvalidPIN]: {
						entry: AuthAction.ClearPIN,
						on: {
							[AuthEventType.SUBMIT_PIN]: {
								actions: AuthAction.SetPIN,
								target: AuthState.ValidatingPINInput,
							},
						},
					},
				},
			},
			[AuthState.Authorised]: {
				id: AuthStateId.Authorised,
				on: {
					[AuthEventType.LOG_OUT]: AuthState.LoggingOut,
					[AuthEventType.REVOKE_PIN]: `#${AuthStateId.PINRevocation}`,
				},
			},
			[AuthState.LoggingOut]: {
				entry: AuthAction.NetworkReqStarted,
				invoke: {
					src: AuthServices.signOut,
					onDone: {
						target: AuthState.CheckingSession,
						actions: [AuthAction.NetworkReqComplete, AuthAction.ClearUser],
					},
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
			[AuthAction.NetworkReqStarted]: assign({ isLoading: (_) => true }),
			[AuthAction.NetworkReqComplete]: assign({ isLoading: (_) => false }),
			[AuthAction.SetUser]: assign({ user: (_, e) => (e as DoneInvokeEvent<UserType>).data }),
			[AuthAction.ClearUser]: assign({ user: (_) => null }),
			[AuthAction.SetPassword]: assign({ password: (_, e) => (e as SubmitOTPEvent).password }),
			[AuthAction.ClearPassword]: assign({ password: (_) => "" }),
			[AuthAction.SetUsername]: assign({ username: (_, e) => (e as SubmitUsernameEvent).username }),
			[AuthAction.ClearUsername]: assign({ username: (_) => "" }),
			[AuthAction.SetUsernamePassword]: assign({
				username: (_, e) => (e as SubmitUsernameAndPasswordEvent).username,
				password: (_, e) => (e as SubmitUsernameAndPasswordEvent).password,
			}),
			[AuthAction.SetPIN]: assign({ pin: (_, e) => (e as SubmitPINEvent).pin }),
			[AuthAction.ActivatePINSecurity]: assign({ pinSecurityActive: (_) => true }),
			[AuthAction.DeactivatePINSecurity]: assign({ pinSecurityActive: (_) => false }),
			[AuthAction.ClearPIN]: assign({ pin: (_) => "" }),
			[AuthAction.DecrementRetries]: assign({
				otpRetriesRemaining: (ctx) => ctx.otpRetriesRemaining - 1,
			}),
			[AuthAction.ResetRetries]: assign({ otpRetriesRemaining: (ctx) => ctx.otpRetriesAllowed }),
		},
		activities: {},
		delays: {},
		guards: {
			[AuthCond.HasRetriesRemaining]: (ctx) => ctx.otpRetriesRemaining > 0,
			[AuthCond.IsUsingOTPAuth]: (ctx) => ctx.useOtpAuth,
			[AuthCond.IsUsingPINSecurity]: (ctx) => ctx.usePinSecurity,
			[AuthCond.NewPINMatches]: (ctx, e) =>
				(e as SubmitPINConfirmationEvent).pinConfirmation === ctx.pin,
		},
		services: {
			[AuthServices.currentSession]: () => {
				throw new Error("No session check service defined");
			},
			[AuthServices.validateUsernameAndPassword]: () => {
				throw new Error("No username/password validation service defined");
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
			[AuthServices.checkHasPINSet]: () => {
				throw new Error("No service defined to check whether a PIN is set or not");
			},
			[AuthServices.setNewPIN]: () => {
				throw new Error("No PIN creation service defined");
			},
			[AuthServices.validatePIN]: () => {
				throw new Error("No PIN validation service defined");
			},
			[AuthServices.revokePIN]: () => {
				throw new Error("No PIN revocation service defined");
			},
		},
	};
}

export type AuthenticatorConfig<UserType, SessionType> = {
	authFunctions: AuthServiceFunctions<UserType, SessionType>;
	useOtpAuth?: boolean;
	usePINSecurity?: boolean;
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
	>).withConfig(
		{
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
				[AuthServices.signOut]: () => authConfig.authFunctions.signOut(),
				[AuthServices.checkHasPINSet]: () => authConfig.authFunctions.checkHasPINSet(),
				[AuthServices.validatePIN]: (ctx) => authConfig.authFunctions.validatePIN(ctx.pin),
				[AuthServices.setNewPIN]: (ctx) => authConfig.authFunctions.setNewPIN(ctx.pin),
				[AuthServices.revokePIN]: () => authConfig.authFunctions.revokePIN(),
			},
		},
		{
			...(machine.context as AuthContext<UserType>),
			usePinSecurity: Boolean(authConfig.usePINSecurity),
			useOtpAuth: Boolean(authConfig.useOtpAuth),
			otpRetriesAllowed: authConfig.allowedOtpAttempts || 1,
		}
	);
}
