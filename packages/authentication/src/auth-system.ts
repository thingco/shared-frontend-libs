/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMachine, StateFrom } from "xstate";
import { createModel } from "xstate/lib/model";

import type { ContextFrom, EventFrom, InterpreterFrom } from "xstate";
import type { AuthenticationSystemError, LoginFlowType } from "./types";

/**
 * XState currently cannot infer the types of the state. This is extremely
 * annoying from a development perspective, so unfortunately I'm having to
 * resort to using a string enum.
 */
export enum AuthStateId {
	awaitingSessionCheck = "awaitingSessionCheck",
	INTERNAL__loginFlowCheck = "INTERNAL__loginFlowCheck",
	awaitingUsername = "awaitingOtpUsername",
	awaitingOtp = "awaitingOtp",
	awaitingUsernameAndPassword = "awaitingUsernameAndPassword",
	awaitingForcedChangePassword = "awaitingForcedChangePassword",
	awaitingNewPassword = "awaitingNewPassword",
	awaitingForgottenPassword = "awaitingForgottenPassword",
	INTERNAL__deviceSecurityCheck = "INTERNAL__deviceSecurityCheck",
	pinChecks = "pinChecks",
	awaitingCurrentPinInput = "awaitingCurrentPinInput",
	awaitingNewPinInput = "awaitingNewPinInput",
	awaitingChangePinInput = "awaitingChangePinInput",
	loggingOut = "loggingOut",
	authenticated = "authenticated",
}

type TContext = {
	error?: AuthenticationSystemError;
	loginFlowType: LoginFlowType;
	username?: string;
	userdata?: any;
	currentPassword?: string;
};

type TEvent =
	| { type: "SESSION_PRESENT" }
	| { type: "SESSION_NOT_PRESENT" }
	| { type: "USERNAME_VALID"; username: string; user: any }
	| { type: "USERNAME_INVALID" }
	| { type: "OTP_VALID"; data?: any }
	| { type: "OTP_INVALID"; data?: any }
	| { type: "OTP_INVALID_RETRIES_EXCEEDED"; data?: any }
	| { type: "USERNAME_AND_PASSWORD_VALID"; username: string }
	| { type: "USERNAME_AND_PASSWORD_USERNAME_INVALID"; username: string }
	| { type: "USERNAME_AND_PASSWORD_PASSWORD_INVALID"; username: string };

type TTState =
	| { value: AuthStateId.awaitingSessionCheck; context: TContext }
	| { value: AuthStateId.awaitingUsername; context: TContext }
	| { value: AuthStateId.awaitingOtp; context: TContext }
	| { value: AuthStateId.authenticated; context: TContext };

const model = createModel<TContext, TEvent>({
	loginFlowType: "OTP",
});

// prettier-ignore
const implementations = {
	guards: {
		isOtpLoginFlow: (ctx: TContext) => ctx.loginFlowType === "OTP",
		isUsernamePasswordLoginFlow: (ctx: TContext) => ctx.loginFlowType === "USERNAME_PASSWORD",
	}
}

export const machine = createMachine<typeof model, TContext, TEvent, TTState>(
	{
		id: "authSystem",
		initial: AuthStateId.awaitingSessionCheck,
		context: model.initialContext,
		// prettier-ignore
		states: {
		[AuthStateId.awaitingSessionCheck]: {
			on: {
				SESSION_PRESENT: AuthStateId.authenticated,
				SESSION_NOT_PRESENT: AuthStateId.awaitingUsername,
			},
		},
		[AuthStateId.INTERNAL__loginFlowCheck]: {
			always: [
				{ cond: "isOtpLoginFlow", target: AuthStateId.awaitingUsername },
				{ cond: "isUsernamePasswordLoginFlow", target: AuthStateId.awaitingUsernameAndPassword },
			],
		},
		[AuthStateId.awaitingUsername]: {
			on: {
				USERNAME_VALID: AuthStateId.awaitingOtp,
				USERNAME_INVALID: undefined,
			},
		},
		[AuthStateId.awaitingOtp]: {
			on: {
				OTP_VALID: AuthStateId.authenticated,
				OTP_INVALID: AuthStateId.awaitingOtp,
				OTP_INVALID_RETRIES_EXCEEDED: AuthStateId.awaitingUsername,
			},
		},
		[AuthStateId.awaitingUsernameAndPassword]: {},
		[AuthStateId.awaitingForcedChangePassword]: {},
		[AuthStateId.awaitingNewPassword]: {},
		[AuthStateId.awaitingForgottenPassword]: {},
		[AuthStateId.INTERNAL__deviceSecurityCheck]: {},
		[AuthStateId.pinChecks]: {},
		[AuthStateId.awaitingCurrentPinInput]: {},
		[AuthStateId.awaitingNewPinInput]: {},
		[AuthStateId.awaitingChangePinInput]: {},
		[AuthStateId.loggingOut]: {},
		[AuthStateId.authenticated]: {},
	},
	},
	implementations
);

export type AuthenticationSystemMachine = typeof machine;
export type AuthenticationSystemContext = ContextFrom<typeof model>;
export type AuthenticationSystemEvent = EventFrom<typeof model>;
export type AuthenticationSystemInterpreter = InterpreterFrom<typeof machine>;
export type AuthenticationSystemState = StateFrom<typeof machine>;

export function createAuthenticationSystem() {
	return machine;
}
