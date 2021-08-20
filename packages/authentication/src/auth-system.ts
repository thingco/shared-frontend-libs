/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMachine, StateFrom } from "xstate";
import { createModel } from "xstate/lib/model";

import type { ContextFrom, EventFrom, InterpreterFrom } from "xstate";
import type { AuthenticationSystemError, DeviceSecurityType, LoginFlowType } from "./types";

/**
 * XState currently cannot infer the types of the state. This is extremely
 * annoying from a development perspective, so unfortunately I'm having to
 * resort to using a string enum.
 */
export enum AuthStateId {
	awaitingSessionCheck = "awaitingSessionCheck",
	INTERNAL__loginFlowCheck = "INTERNAL__loginFlowCheck",
	awaitingOtpUsername = "awaitingOtpUsername",
	awaitingOtp = "awaitingOtp",
	awaitingUsernameAndPassword = "awaitingUsernameAndPassword",
	awaitingForcedChangePassword = "awaitingForcedChangePassword",
	awaitingChangePassword = "awaitingChangePassword",
	awaitingPasswordResetRequest = "awaitingPasswordResetRequest",
	awaitingPasswordResetSubmission = "awaitingPasswordResetSubmission",
	INTERNAL__deviceSecurityCheck = "INTERNAL__deviceSecurityCheck",
	// pinChecks = "pinChecks",
	// awaitingCurrentPinInput = "awaitingCurrentPinInput",
	// awaitingNewPinInput = "awaitingNewPinInput",
	// awaitingChangePinInput = "awaitingChangePinInput",
	loggingOut = "loggingOut",
	authenticated = "authenticated",
}

type TContext = {
	error?: AuthenticationSystemError;
	loginFlowType: LoginFlowType;
	deviceSecurityType: DeviceSecurityType;
	username?: string;
	user?: any;
};

type TEvent =
	| { type: "SESSION_PRESENT" }
	| { type: "SESSION_NOT_PRESENT" }
	| { type: "USERNAME_VALID"; username: string; user: any }
	| { type: "USERNAME_INVALID" }
	| { type: "OTP_VALID"; user: any }
	| { type: "OTP_INVALID" }
	| { type: "OTP_INVALID_RETRIES_EXCEEDED" }
	| { type: "USERNAME_AND_PASSWORD_VALID"; username: string; user: any }
	| { type: "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED"; user: any; username: string }
	| { type: "USERNAME_AND_PASSWORD_INVALID" }
	| { type: "GO_BACK" }
	| { type: "FORGOTTEN_PASSWORD" }
	| { type: "PASSWORD_CHANGE_SUCCESS" }
	| { type: "PASSWORD_CHANGE_FAILURE" }
	| { type: "PASSWORD_RESET_REQUEST_SUCCESS" }
	| { type: "PASSWORD_RESET_REQUEST_FAILURE" }
	| { type: "PASSWORD_RESET_SUCCESS" }
	| { type: "PASSWORD_RESET_FAILURE" }
	| { type: "LOG_OUT_SUCCESS" }
	| { type: "LOG_OUT_FAILURE" }
	| { type: "CANCEL_LOG_OUT" }
	| { type: "REQUEST_LOG_OUT" }
	| { type: "REQUEST_PASSWORD_CHANGE" };

// prettier-ignore
type TTState =
	| { value: AuthStateId.awaitingSessionCheck; context: TContext }
	| { value: AuthStateId.awaitingOtpUsername; context: TContext }
	| { value: AuthStateId.awaitingOtp; context: TContext & { user: any; username: string } }
	| { value: AuthStateId.awaitingUsernameAndPassword; context: TContext }
	| {	value: AuthStateId.awaitingForcedChangePassword; context: TContext & { user: any; username: string } }
	| { value: AuthStateId.awaitingChangePassword; context: TContext & { username: string } }
	| { value: AuthStateId.awaitingPasswordResetRequest; context: TContext & { username: string } }
	| { value: AuthStateId.awaitingPasswordResetSubmission; context: TContext & { username: string } }
	| { value: AuthStateId.loggingOut; context: TContext & { username: string; } }
	| { value: AuthStateId.authenticated; context: TContext & { username: string; } };

const model = createModel<TContext, TEvent>({
	loginFlowType: "OTP",
	deviceSecurityType: "NONE",
});

// prettier-ignore
const implementations = {
	guards: {
		isOtpLoginFlow: (ctx: TContext) => ctx.loginFlowType === "OTP",
		isUsernamePasswordLoginFlow: (ctx: TContext) => ctx.loginFlowType === "USERNAME_PASSWORD",
		isDeviceSecurityTypeNone: (ctx: TContext) => ctx.deviceSecurityType === "NONE",
		isDeviceSecurityTypePin: (ctx: TContext) => ctx.deviceSecurityType === "PIN",
		isDeviceSecurityTypeBiometric: (ctx: TContext) => ctx.deviceSecurityType === "BIOMETRIC",
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
				SESSION_PRESENT: AuthStateId.INTERNAL__deviceSecurityCheck,
				SESSION_NOT_PRESENT: AuthStateId.awaitingOtpUsername,
			},
		},
		[AuthStateId.INTERNAL__loginFlowCheck]: {
			always: [
				{ cond: "isOtpLoginFlow", target: AuthStateId.awaitingOtpUsername },
				{ cond: "isUsernamePasswordLoginFlow", target: AuthStateId.awaitingUsernameAndPassword },
			],
		},
		[AuthStateId.awaitingOtpUsername]: {
			on: {
				USERNAME_VALID: AuthStateId.awaitingOtp,
				USERNAME_INVALID: undefined,
			},
		},
		[AuthStateId.awaitingOtp]: {
			on: {
				OTP_VALID: AuthStateId.INTERNAL__deviceSecurityCheck,
				OTP_INVALID: AuthStateId.awaitingOtp,
				OTP_INVALID_RETRIES_EXCEEDED: AuthStateId.awaitingOtpUsername,
				GO_BACK: AuthStateId.awaitingOtpUsername,
			},
		},
		[AuthStateId.awaitingUsernameAndPassword]: {
			on: {
				USERNAME_AND_PASSWORD_VALID: AuthStateId.INTERNAL__deviceSecurityCheck,
				USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED: AuthStateId.awaitingForcedChangePassword,
				USERNAME_AND_PASSWORD_INVALID: undefined,
				FORGOTTEN_PASSWORD: AuthStateId.awaitingPasswordResetRequest
			}
		},
		[AuthStateId.awaitingForcedChangePassword]: {
			on: {
				PASSWORD_CHANGE_SUCCESS: AuthStateId.INTERNAL__deviceSecurityCheck,
				PASSWORD_CHANGE_FAILURE: undefined,
			}
		},
		[AuthStateId.awaitingPasswordResetRequest]: {
			on: {
				PASSWORD_RESET_REQUEST_SUCCESS: AuthStateId.awaitingPasswordResetSubmission,
				PASSWORD_RESET_REQUEST_FAILURE: AuthStateId.awaitingUsernameAndPassword,
			}
		},
		[AuthStateId.awaitingPasswordResetSubmission]: {
			on: {
				PASSWORD_RESET_SUCCESS: AuthStateId.INTERNAL__deviceSecurityCheck,
				// TODO will get stuck here, need to figure out how best to handle this:
				PASSWORD_RESET_FAILURE: undefined,
			}
		},
		[AuthStateId.awaitingChangePassword]: {
			on: {
				PASSWORD_CHANGE_SUCCESS: AuthStateId.authenticated,
				PASSWORD_CHANGE_FAILURE: undefined,
			}
		},
		[AuthStateId.INTERNAL__deviceSecurityCheck]: {
			always: [
				{ cond: "isDeviceSecurityTypeNone", target: AuthStateId.authenticated },
				// { cond: "isDeviceSecurityTypePin", target: AuthStateId.pinChecks },
				// { cond: "isDeviceSecurityTypeBiometric", target: AuthStateId.authenticated },
			],	
		},
		// [AuthStateId.pinChecks]: {},
		// [AuthStateId.awaitingCurrentPinInput]: {},
		// [AuthStateId.awaitingNewPinInput]: {},
		// [AuthStateId.awaitingChangePinInput]: {},
		[AuthStateId.loggingOut]: {
			on: {
				LOG_OUT_SUCCESS: AuthStateId.awaitingSessionCheck,
				LOG_OUT_FAILURE: undefined,
				CANCEL_LOG_OUT: AuthStateId.authenticated
			}
		},
		[AuthStateId.authenticated]: {
			on: {
				REQUEST_LOG_OUT: AuthStateId.loggingOut,
				REQUEST_PASSWORD_CHANGE: AuthStateId.awaitingChangePassword
			}
		},
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
