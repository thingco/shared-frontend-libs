/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMachine, StateFrom } from "xstate";
import { createModel } from "xstate/lib/model";

import type { ContextFrom, EventFrom, InterpreterFrom } from "xstate";
import type {
	AuthenticationSystemConfig,
	AuthenticationSystemError,
	DeviceSecurityType,
	LoginFlowType,
} from "./types";
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
	deviceSecurityType: DeviceSecurityType;
	username?: string;
	user?: any;
};

type TEvent =
	| { type: "SESSION_PRESENT" }
	| { type: "SESSION_NOT_PRESENT" }
	| { type: "USERNAME_VALID"; username: string; user: any }
	// REVIEW: WHY is it invalid?
	| { type: "USERNAME_INVALID"; error: "USERNAME_INVALID" }
	| { type: "OTP_VALID" }
	// REVIEW: WHY is it invalid?
	| { type: "OTP_INVALID"; error: `PASSWORD_INVALID_${number}_RETRIES_REMAINING` }
	| { type: "OTP_INVALID_RETRIES_EXCEEDED"; error: "PASSWORD_RETRIES_EXCEEDED" }
	// REVIEW: unecessary? We're authorised past this point, don't need the `user` but `username` might be useful:
	| { type: "USERNAME_AND_PASSWORD_VALID"; username: string; user: any }
	| {
			type: "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED";
			user: any;
			username: string;
			error: "PASSWORD_CHANGE_REQUIRED";
	  }
	// REVIEW: WHICH ONE is invalid?
	| { type: "USERNAME_AND_PASSWORD_INVALID"; error: "USERNAME_AND_PASSWORD_INVALID" }
	| { type: "GO_BACK" }
	| { type: "FORGOTTEN_PASSWORD" }
	| { type: "PASSWORD_CHANGE_SUCCESS" }
	// REVIEW: WHY did it fail?
	| { type: "PASSWORD_CHANGE_FAILURE"; error: "PASSWORD_CHANGE_FAILURE" }
	| { type: "CANCEL_PASSWORD_CHANGE" }
	| { type: "PASSWORD_RESET_REQUEST_SUCCESS"; username: string }
	// REVIEW: WHY did it fail?
	| { type: "PASSWORD_RESET_REQUEST_FAILURE"; error: "PASSWORD_RESET_REQUEST_FAILURE" }
	| { type: "PASSWORD_RESET_SUCCESS" }
	// REVIEW: WHY did it fail?
	| { type: "PASSWORD_RESET_FAILURE"; error: "PASSWORD_RESET_FAILURE" }
	| { type: "LOG_OUT_SUCCESS" }
	// REVIEW: WHY did it fail?
	| { type: "LOG_OUT_FAILURE"; error: "LOG_OUT_FAILURE" }
	| { type: "CANCEL_LOG_OUT" }
	| { type: "REQUEST_LOG_OUT" }
	| { type: "REQUEST_PASSWORD_CHANGE" }
	| { type: "PIN_IS_SET_UP" }
	| { type: "PIN_IS_NOT_SET_UP" }
	| { type: "PIN_VALID" }
	// REVIEW: WHY is it invalid?
	| { type: "PIN_INVALID"; error: "PIN_INVALID" }
	| { type: "NEW_PIN_VALID" }
	// REVIEW: WHY is it invalid?
	| { type: "NEW_PIN_INVALID"; error: "NEW_PIN_INVALID" }
	| { type: "PIN_CHANGE_SUCCESS" }
	// REVIEW: WHY did it fail?
	| { type: "PIN_CHANGE_FAILURE"; error: "PIN_CHANGE_FAILURE" }
	| { type: "CANCEL_PIN_CHANGE" }
	| { type: "REQUEST_PIN_CHANGE" };

// prettier-ignore
type TTState =
	| { value: AuthStateId.awaitingSessionCheck; context: TContext }
	| { value: AuthStateId.awaitingOtpUsername; context: TContext }
	| { value: AuthStateId.awaitingOtp; context: TContext & { user: any; username: string } }
	| { value: AuthStateId.awaitingUsernameAndPassword; context: TContext }
	| {	value: AuthStateId.awaitingForcedChangePassword; context: TContext & { user: any; username: string; error: AuthenticationSystemError } }
	| { value: AuthStateId.awaitingChangePassword; context: TContext & { username: string } }
	| { value: AuthStateId.awaitingPasswordResetRequest; context: TContext }
	| { value: AuthStateId.awaitingPasswordResetSubmission; context: TContext & { username: string } }
	| { value: AuthStateId.pinChecks; context: TContext & { username?: string } }
	| { value: AuthStateId.awaitingCurrentPinInput; context: TContext & { username?: string } }
	| { value: AuthStateId.awaitingNewPinInput; context: TContext & { username?: string } }
	| { value: AuthStateId.awaitingChangePinInput; context: TContext & { username?: string } }
	| { value: AuthStateId.loggingOut; context: TContext & { username?: string; } }
	| { value: AuthStateId.authenticated; context: TContext & { username?: string; } };

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
	},
	actions: {
		assignError: model.assign((_, e) => {
			if ("error" in e) {
				return { error: e.error };
			}
			return {}
		}),
		assignUser: model.assign((_, e) => {
			if (e.type === "USERNAME_VALID" || e.type === "USERNAME_AND_PASSWORD_VALID" || e.type === "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED") {
				return { username: e.username };
			}
			return {};
		}),
		assignUsername: model.assign((_, e) => {
			if (e.type === "USERNAME_VALID" || e.type === "USERNAME_AND_PASSWORD_VALID" || e.type === "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED" || e.type === "PASSWORD_RESET_REQUEST_SUCCESS") {
				return { username: e.username };
			}
			return {};
		}),
		clearError: model.assign({ error: undefined }),
		clearUser: model.assign({ user: undefined }),
		clearUsername: model.assign({ username: undefined })
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
				SESSION_NOT_PRESENT: AuthStateId.INTERNAL__loginFlowCheck,
			},
		},
		[AuthStateId.INTERNAL__loginFlowCheck]: {
			entry: ["clearError"],
			always: [
				{ cond: "isOtpLoginFlow", target: AuthStateId.awaitingOtpUsername },
				{ cond: "isUsernamePasswordLoginFlow", target: AuthStateId.awaitingUsernameAndPassword },
			],
		},
		[AuthStateId.awaitingOtpUsername]: {
			on: {
				USERNAME_VALID: {
					target: AuthStateId.awaitingOtp,
					actions: ["assignUser", "assignUsername", "clearError"],
				},
				USERNAME_INVALID: {
					target: undefined,
					actions: ["assignError"]
				}
			},
		},
		[AuthStateId.awaitingOtp]: {
			on: {
				OTP_VALID: {
					target: AuthStateId.INTERNAL__deviceSecurityCheck,
					actions: ["clearError"],
				},
				OTP_INVALID: {
					target: AuthStateId.awaitingOtp,
					actions: ["assignError"]
				},
				OTP_INVALID_RETRIES_EXCEEDED: {
					target: AuthStateId.awaitingOtpUsername,
					actions: ["assignError"]
				},
				GO_BACK: {
					target: AuthStateId.awaitingOtpUsername,
					// Going to start again, so don't want these hanging around:
					actions: ["clearError", "clearUser", "clearUsername"],
				}
			},
		},
		[AuthStateId.awaitingUsernameAndPassword]: {
			on: {
				USERNAME_AND_PASSWORD_VALID: {
					target: AuthStateId.INTERNAL__deviceSecurityCheck,
					// REVEIW: unecessary? We're authorised past this point, don't need the `user` but `username` might be useful:
					// actions: ["assignUser", "assignUsername"]
					actions: ["clearError"],
				},
				USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED: {
					target: AuthStateId.awaitingForcedChangePassword,
					actions: ["assignError", "assignUser", "assignUsername"],
				},
				USERNAME_AND_PASSWORD_INVALID: {
					target: undefined,
					actions: ["assignError"]
				},
				FORGOTTEN_PASSWORD: {
					target: AuthStateId.awaitingPasswordResetRequest,
					actions: ["clearError"],
				},
			}
		},
		[AuthStateId.awaitingForcedChangePassword]: {
			on: {
				PASSWORD_CHANGE_SUCCESS: {
					target: AuthStateId.INTERNAL__deviceSecurityCheck,
					actions: ["clearError"],
				},
				PASSWORD_CHANGE_FAILURE: {
					target: undefined,
					actions: ["assignError"]
				},
			}
		},
		[AuthStateId.awaitingPasswordResetRequest]: {
			on: {
				PASSWORD_RESET_REQUEST_SUCCESS: {
					target: AuthStateId.awaitingPasswordResetSubmission,
					actions: ["clearError", "assignUsername"],
				},
				PASSWORD_RESET_REQUEST_FAILURE: {
					target: AuthStateId.awaitingUsernameAndPassword,
					actions: ["assignError"]
				},
			}
		},
		[AuthStateId.awaitingPasswordResetSubmission]: {
			on: {
				PASSWORD_RESET_SUCCESS: {
					target: AuthStateId.INTERNAL__deviceSecurityCheck,
					actions: ["clearError"],
				},
				// TODO will get stuck here, need to figure out how best to handle this:
				PASSWORD_RESET_FAILURE: {
					target: undefined,
					actions: ["assignError"]
				},
			}
		},
		[AuthStateId.awaitingChangePassword]: {
			on: {
				PASSWORD_CHANGE_SUCCESS: {
					target: AuthStateId.authenticated,
					actions: ["clearError"],
				},
				// TODO will get stuck here, need to figure out how best to handle this:
				PASSWORD_CHANGE_FAILURE: {
					target: undefined,
					actions: ["assignError"]
				},
				CANCEL_PASSWORD_CHANGE: AuthStateId.authenticated,
			}
		},
		[AuthStateId.INTERNAL__deviceSecurityCheck]: {
			entry: ["clearError"],
			always: [
				{ cond: "isDeviceSecurityTypeNone", target: AuthStateId.authenticated },
				{ cond: "isDeviceSecurityTypePin", target: AuthStateId.pinChecks },
				// { cond: "isDeviceSecurityTypeBiometric", target: AuthStateId.authenticated },
			],	
		},
		[AuthStateId.pinChecks]: {
			on: {
				PIN_IS_SET_UP: AuthStateId.awaitingCurrentPinInput,
				PIN_IS_NOT_SET_UP: AuthStateId.awaitingNewPinInput,
			}
		},
		[AuthStateId.awaitingCurrentPinInput]: {
			on: {
				PIN_VALID: {
					target: AuthStateId.authenticated,
					actions: ["clearError"],
				},
				PIN_INVALID: {
					target: undefined,
					actions: ["assignError"]
				},
				// TODO forgotten pin needs to completely log the user out
				// FORGOTTEN_PIN: .....
			}
		},
		[AuthStateId.awaitingNewPinInput]: {
			on: {
				NEW_PIN_VALID: {
					target: AuthStateId.authenticated,
					actions: ["clearError"],
				},
				NEW_PIN_INVALID: {
					target: undefined,
					actions: ["assignError"]
				},
			}	
		},
		[AuthStateId.awaitingChangePinInput]: {
			on: {
				PIN_CHANGE_SUCCESS: {
					target:AuthStateId.authenticated,
					actions: ["clearError"],
				},
				PIN_CHANGE_FAILURE: {
					target: undefined,
					actions: ["assignError"]
				},
				CANCEL_PIN_CHANGE: {
					target: AuthStateId.authenticated,
					actions: ["clearError"]
				}
			}
		},
		[AuthStateId.loggingOut]: {
			on: {
				LOG_OUT_SUCCESS: AuthStateId.awaitingSessionCheck,
				LOG_OUT_FAILURE: {
					target: undefined,
					actions: ["assignError"]
				},
				CANCEL_LOG_OUT: AuthStateId.authenticated
			}
		},
		[AuthStateId.authenticated]: {
			entry: ["clearError"],
			on: {
				REQUEST_LOG_OUT: AuthStateId.loggingOut,
				REQUEST_PIN_CHANGE: AuthStateId.awaitingChangePinInput,
				REQUEST_PASSWORD_CHANGE: AuthStateId.awaitingChangePassword,
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

export function createAuthenticationSystem({
	loginFlowType = "OTP",
	deviceSecurityType = "NONE",
}: AuthenticationSystemConfig = {}) {
	return machine.withContext({ loginFlowType, deviceSecurityType });
}
