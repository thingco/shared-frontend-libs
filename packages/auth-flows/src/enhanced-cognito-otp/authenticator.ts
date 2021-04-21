/**
 * Enhanced Cognito-OTP-based authentication flow.
 *
 * Instead of the basic Cognito OTP authenticator, this one is divided into
 * stages, each with their own machinery.
 *
 */
import { assign, Machine, MachineConfig, MachineOptions, StateMachine } from "xstate";

import {
	createLogoutService,
	createOtpInputService,
	createSessionCheckService,
	createUsernameInputService,
} from "./services";

import type {
	AuthenticatorContext,
	AuthenticatorSchema,
	AuthenticatorEvents,
	AuthenticatorServiceFunctions,
} from "./types";

function authenticatorConfig<UserType>(): MachineConfig<
	AuthenticatorContext<UserType>,
	AuthenticatorSchema,
	AuthenticatorEvents<UserType>
> {
	return {
		id: "authenticator",
		context: {
			isLoading: false,
			useOtpAuth: true,
			user: null,
		},
		on: {
			NETWORK_REQUEST_COMPLETE: {
				actions: () => assign({ isLoading: false }),
				internal: true,
			},
			NETWORK_REQUEST_IN_PROGRESS: {
				actions: () => assign({ isLoading: true }),
				internal: true,
			},
			OTP_RETRIES_EXCEEDED: {
				target: "checkingSession",
			},
			USER_DETAILS_RECEIVED: {
				actions: (_, e) => assign({ user: e.data }),
				internal: true,
			},
		},
		states: {
			checkingSession: {
				invoke: {
					src: "sessionCheckService",
					onDone: "authorised",
					onError: [
						{
							cond: (ctx) => ctx.useOtpAuth,
							target: "userIdentifierInput",
						},
						{
							target: "usernamePasswordInput",
						},
					],
				},
			},
			userIdentifierInput: {
				invoke: {
					src: "usernameInputService",
					onDone: "otpInput",
				},
			},
			otpInput: {
				invoke: {
					src: "otpInputService",
					data: {
						user: (ctx: AuthenticatorContext<UserType>) => ctx.user,
					},
					onDone: "authorised",
					onError: "userIdentifierInput",
				},
			},
			usernamePasswordInput: {
				invoke: {
					src: "usernamePasswordInputService",
					onDone: "authorised",
				},
			},
			loggingOut: {
				invoke: {
					src: "logoutService",
				},
				onDone: "checkingSession",
			},
			authorised: {
				on: {
					LOG_OUT: "loggingOut",
				},
			},
		},
	};
}

function authenticatorOptions<UserType>(): MachineOptions<
	AuthenticatorContext<UserType>,
	AuthenticatorEvents<UserType>
> {
	return {
		actions: {},
		activities: {},
		delays: {},
		guards: {},
		services: {
			sessionCheckService: () => {
				throw new Error("No session check service defined");
			},
			usernameInputService: () => {
				throw new Error("No unsername input service defined");
			},
			otpInputService: () => {
				throw new Error("No OTP input service defined");
			},
			logoutService: () => {
				throw new Error("No logout service defined");
			},
		},
	};
}

export type AuthenticatorConfig<UserType, SessionType> = {
	authFunctions: AuthenticatorServiceFunctions<UserType, SessionType>;
	useOtpAuth?: boolean;
	allowedOtpAttempts?: number;
};

export function createAuthenticator<UserType, SessionType>(
	authConfig: AuthenticatorConfig<UserType, SessionType>
): StateMachine<
	AuthenticatorContext<UserType>,
	AuthenticatorSchema,
	AuthenticatorEvents<UserType>
> {
	const machine = Machine(authenticatorConfig(), authenticatorOptions());

	return (machine as StateMachine<
		AuthenticatorContext<UserType>,
		AuthenticatorSchema,
		AuthenticatorEvents<UserType>
	>)
		.withConfig({
			services: {
				sessionCheckService: createSessionCheckService(authConfig.authFunctions.checkSession),
				usernameInputService: createUsernameInputService(authConfig.authFunctions.validateUsername),
				otpInputService: createOtpInputService(
					authConfig.authFunctions.validateOtp,
					authConfig.allowedOtpAttempts || 3
				),
				logoutService: createLogoutService(authConfig.authFunctions.logOut),
			},
		})
		.withContext({
			isLoading: false,
			useOtpAuth: Boolean(authConfig.useOtpAuth),
			user: null,
		});
}
