import { createMachine } from "xstate";
import { createModel } from "xstate/lib/model";

import { AuthStateId } from "./enums";

import type {
	AuthConfig,
	AuthMachine,
	InternalAuthContext,
	InternalAuthEvent,
	InternalAuthTypeState,
} from "./types";

/* ------------------------------------------------------------------------------------------------------ *\
 * SYSTEM MODEL/FSM
 * ------------------------------------------------------------------------------------------------------
 * Internal to the library (functionality is exposed via the React interface), but the actual core
 * of the entire system.
\* ------------------------------------------------------------------------------------------------------ */

/**
 * By using XState's `createModel` function, we get most of the type inference for free
 *
 * @internal
 */
export const model = createModel<InternalAuthContext, InternalAuthEvent>({
	loginFlowType: "OTP",
	deviceSecurityType: "NONE",
	allowedOtpRetries: 3,
	pinLength: 4,
});

/**
 * XState uses a serialisable object for defining the FSM. To allow it to be serialisable, anything
 * that requires concrete functions to work (actions, guards *etc.*) is aliased under a string key
 * within that object. Then the `createMachine` function accepts a second object with the implementations
 * for those aliases.
 *
 * @internal
 */
const implementations = {
	guards: {
		isOtpLoginFlow: (ctx: InternalAuthContext) => ctx.loginFlowType === "OTP",
		isUsernamePasswordLoginFlow: (ctx: InternalAuthContext) =>
			ctx.loginFlowType === "USERNAME_PASSWORD",
		isDeviceSecurityTypeNone: (ctx: InternalAuthContext) => ctx.deviceSecurityType === "NONE",
		isDeviceSecurityTypePin: (ctx: InternalAuthContext) => ctx.deviceSecurityType === "PIN",
		isDeviceSecurityTypeBiometric: (ctx: InternalAuthContext) =>
			ctx.deviceSecurityType === "BIOMETRIC",
	},
	actions: {
		assignError: model.assign((_, e) => {
			if ("error" in e) {
				return { error: e.error };
			}
			return {};
		}),
		assignUser: model.assign((_, e) => {
			if (
				e.type === "USERNAME_VALID" ||
				e.type === "USERNAME_AND_PASSWORD_VALID" ||
				e.type === "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED"
			) {
				return { user: e.user };
			}
			return {};
		}),
		assignUsername: model.assign((_, e) => {
			if (
				e.type === "USERNAME_VALID" ||
				e.type === "USERNAME_AND_PASSWORD_VALID" ||
				e.type === "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED" ||
				e.type === "PASSWORD_RESET_REQUEST_SUCCESS"
			) {
				return { username: e.username };
			}
			return {};
		}),
		clearError: model.assign({ error: undefined }),
		clearUser: model.assign({ user: undefined }),
		clearUsername: model.assign({ username: undefined }),
	},
};

/**
 * The actual machine. Inference is still not perfect due to usage of string keys for all aliased
 * implementations, but by using the core types defined above we get most of the way there.
 *
 * @internal
 */
export const machine = createMachine<
	typeof model,
	InternalAuthContext,
	InternalAuthEvent,
	InternalAuthTypeState
>(
	{
		id: "authSystem",
		initial: AuthStateId.CheckingForSession,
		context: model.initialContext,
		states: {
			[AuthStateId.CheckingForSession]: {
				on: {
					SESSION_PRESENT: AuthStateId.INTERNAL__deviceSecurityCheck,
					SESSION_NOT_PRESENT: AuthStateId.INTERNAL__loginFlowCheck,
				},
			},
			[AuthStateId.INTERNAL__loginFlowCheck]: {
				entry: ["clearError"],
				always: [
					{ cond: "isOtpLoginFlow", target: AuthStateId.SubmittingOtpUsername },
					{
						cond: "isUsernamePasswordLoginFlow",
						target: AuthStateId.SubmittingUsernameAndPassword,
					},
				],
			},
			[AuthStateId.SubmittingOtpUsername]: {
				on: {
					USERNAME_VALID: {
						target: AuthStateId.SubmittingOtp,
						actions: ["assignUser", "assignUsername", "clearError"],
					},
					USERNAME_INVALID: {
						target: undefined,
						actions: ["assignError"],
					},
				},
			},
			[AuthStateId.SubmittingOtp]: {
				on: {
					OTP_VALID: {
						target: AuthStateId.INTERNAL__deviceSecurityCheck,
						actions: ["clearError"],
					},
					OTP_INVALID: {
						target: undefined,
						actions: ["assignError"],
					},
					OTP_INVALID_RETRIES_EXCEEDED: {
						target: AuthStateId.SubmittingOtpUsername,
						actions: ["assignError"],
					},
					GO_BACK: {
						target: AuthStateId.SubmittingOtpUsername,
						// Going to start again, so don't want these hanging around:
						actions: ["clearError", "clearUser", "clearUsername"],
					},
				},
			},
			[AuthStateId.SubmittingUsernameAndPassword]: {
				on: {
					USERNAME_AND_PASSWORD_VALID: {
						target: AuthStateId.INTERNAL__deviceSecurityCheck,
						// REVIEW: unecessary? We're authorised past this point, don't need the `user` but `username` might be useful:
						actions: ["assignUser", "assignUsername", "clearError"],
					},
					USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED: {
						target: AuthStateId.SubmittingForceChangePassword,
						actions: ["assignError", "assignUser", "assignUsername"],
					},
					USERNAME_AND_PASSWORD_INVALID: {
						target: undefined,
						actions: ["assignError"],
					},
					FORGOTTEN_PASSWORD: {
						target: AuthStateId.ForgottenPasswordRequestingReset,
						actions: ["clearError"],
					},
				},
			},
			[AuthStateId.SubmittingForceChangePassword]: {
				on: {
					PASSWORD_CHANGE_SUCCESS: {
						target: AuthStateId.INTERNAL__deviceSecurityCheck,
						actions: ["clearError"],
					},
					PASSWORD_CHANGE_FAILURE: {
						target: undefined,
						actions: ["assignError"],
					},
				},
			},
			[AuthStateId.ForgottenPasswordRequestingReset]: {
				on: {
					PASSWORD_RESET_REQUEST_SUCCESS: {
						target: AuthStateId.ForgottenPasswordSubmittingReset,
						actions: ["clearError", "assignUsername"],
					},
					PASSWORD_RESET_REQUEST_FAILURE: {
						target: undefined,
						actions: ["assignError"],
					},
					GO_BACK: {
						target: AuthStateId.SubmittingUsernameAndPassword,
						actions: ["clearError"],
					},
				},
			},
			[AuthStateId.ForgottenPasswordSubmittingReset]: {
				on: {
					PASSWORD_RESET_SUCCESS: {
						target: AuthStateId.ForgottenPasswordResetSuccess,
						actions: ["clearError"],
					},
					PASSWORD_RESET_FAILURE: {
						target: undefined,
						actions: ["assignError"],
					},
					GO_BACK: AuthStateId.ForgottenPasswordRequestingReset,
				},
			},
			[AuthStateId.ForgottenPasswordResetSuccess]: {
				on: {
					CONFIRM_PASSWORD_RESET: {
						target: AuthStateId.SubmittingUsernameAndPassword,
						actions: ["clearUsername"],
					},
				},
			},
			[AuthStateId.INTERNAL__deviceSecurityCheck]: {
				entry: ["clearError"],
				always: [
					{ cond: "isDeviceSecurityTypeNone", target: AuthStateId.Authenticated },
					{ cond: "isDeviceSecurityTypePin", target: AuthStateId.CheckingForPin },
					// { cond: "isDeviceSecurityTypeBiometric", target: AuthStateId.Authenticated },
				],
			},
			[AuthStateId.CheckingForPin]: {
				on: {
					PIN_IS_SET_UP: AuthStateId.SubmittingCurrentPin,
					PIN_IS_NOT_SET_UP: AuthStateId.SubmittingNewPin,
				},
			},
			[AuthStateId.SubmittingCurrentPin]: {
				on: {
					PIN_VALID: {
						target: AuthStateId.Authenticated,
						actions: ["clearError"],
					},
					PIN_INVALID: {
						target: undefined,
						actions: ["assignError"],
					},
					REQUEST_PIN_RESET: {
						target: AuthStateId.ForgottenPinRequestingReset,
						actions: ["clearError"],
					},
				},
			},
			[AuthStateId.ForgottenPinRequestingReset]: {
				on: {
					PIN_RESET_SUCCESS: {
						target: AuthStateId.CheckingForSession,
						actions: ["clearError"],
					},
					PIN_RESET_FAILURE: {
						target: undefined,
						actions: ["assignError"],
					},
					CANCEL_PIN_RESET: {
						target: AuthStateId.SubmittingCurrentPin,
						actions: ["clearError"],
					},
				},
			},
			[AuthStateId.SubmittingNewPin]: {
				on: {
					NEW_PIN_VALID: {
						target: AuthStateId.Authenticated,
						actions: ["clearError"],
					},
					NEW_PIN_INVALID: {
						target: undefined,
						actions: ["assignError"],
					},
				},
			},
			[AuthStateId.Authenticated]: {
				entry: ["clearError"],
				on: {
					REQUEST_LOG_OUT: AuthStateId.AuthenticatedLoggingOut,
					REQUEST_PIN_CHANGE: AuthStateId.AuthenticatedValidatingPin,
					REQUEST_PASSWORD_CHANGE: AuthStateId.AuthenticatedChangingPassword,
				},
			},
			[AuthStateId.AuthenticatedChangingPassword]: {
				on: {
					PASSWORD_CHANGE_SUCCESS: {
						target: AuthStateId.AuthenticatedPasswordChangeSuccess,
						actions: ["clearError"],
					},
					PASSWORD_CHANGE_FAILURE: {
						target: undefined,
						actions: ["assignError"],
					},
					CANCEL_PASSWORD_CHANGE: AuthStateId.Authenticated,
				},
			},
			[AuthStateId.AuthenticatedPasswordChangeSuccess]: {
				on: {
					CONFIRM_PASSWORD_CHANGE: AuthStateId.Authenticated,
				},
			},
			[AuthStateId.AuthenticatedValidatingPin]: {
				on: {
					PIN_VALID: {
						target: AuthStateId.AuthenticatedChangingPin,
						actions: ["clearError"],
					},
					PIN_INVALID: {
						target: undefined,
						actions: ["assignError"],
					},
					CANCEL_PIN_CHANGE: {
						target: AuthStateId.Authenticated,
						actions: ["clearError"],
					},
				},
			},
			[AuthStateId.AuthenticatedChangingPin]: {
				on: {
					PIN_CHANGE_SUCCESS: {
						target: AuthStateId.AuthenticatedPinChangeSuccess,
						actions: ["clearError"],
					},
					PIN_CHANGE_FAILURE: {
						target: undefined,
						actions: ["assignError"],
					},
					CANCEL_PIN_CHANGE: {
						target: AuthStateId.Authenticated,
						actions: ["clearError"],
					},
				},
			},
			[AuthStateId.AuthenticatedPinChangeSuccess]: {
				on: {
					CONFIRM_PIN_CHANGE: AuthStateId.Authenticated,
				},
			},
			[AuthStateId.AuthenticatedLoggingOut]: {
				on: {
					LOG_OUT_SUCCESS: AuthStateId.CheckingForSession,
					LOG_OUT_FAILURE: {
						target: undefined,
						actions: ["assignError"],
					},
					CANCEL_LOG_OUT: AuthStateId.Authenticated,
				},
			},
		},
	},
	implementations
);

/**
 * Factory function for constructing a configured auth system FSM.
 */
export function createAuthenticationSystem({
	loginFlowType = "OTP",
	deviceSecurityType = "NONE",
	allowedOtpRetries = 3,
	pinLength = 4,
}: AuthConfig = {}): AuthMachine {
	return machine.withContext({ loginFlowType, deviceSecurityType, allowedOtpRetries, pinLength });
}
