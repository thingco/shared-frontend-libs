import { createModel } from "xstate/lib/model";

import { AuthStateId } from "./enums";

import type {
	AuthConfig,
	AuthMachine,
	InternalAuthContext,
	InternalAuthEvent,
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
	loginCompleted: false,
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
		userHasCompletedLogin: (ctx: InternalAuthContext) => ctx.loginCompleted,
	},
	actions: {
		assignError: model.assign((_, e) => {
			if ("error" in e) {
				return { error: e.error };
			}
			return {};
		}),
		assignLoginComplete: model.assign({ loginCompleted: true }),
		assignUser: model.assign((_, e) => {
			if (
				e.type === "PASSWORD_FORCE_CHANGE_SUCCESS" ||
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
		clearLoginComplete: model.assign({ loginCompleted: false }),
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
export const machine = model.createMachine(
	{
		id: "authSystem",
		initial: AuthStateId.CheckingSession,
		context: model.initialContext,
		states: {
			[AuthStateId.CheckingSession]: {
				entry: ["clearLoginComplete"],
				on: {
					SESSION_PRESENT: {
						target: AuthStateId.INTERNAL__deviceSecurityCheck,
						description: "With an existing session, user only needs to authenticate against device security to access app"
					},
					SESSION_NOT_PRESENT: {
						target: AuthStateId.INTERNAL__loginFlowCheck,
						description: "With no existing session, user must complete the login process."
					}
				},
				description: "Session check initiated: if it resolves, there is a session present. If not, move to login."
			},
			[AuthStateId.INTERNAL__loginFlowCheck]: {
				entry: ["clearError"],
				always: [
					{ cond: "isOtpLoginFlow", target: AuthStateId.SubmittingOtpUsername },
					{ cond: "isUsernamePasswordLoginFlow", target: AuthStateId.SubmittingUsernameAndPassword, },
				],
				description: "Internal state, used for switching flows based on initial config values provided by a client."
			},
			[AuthStateId.SubmittingOtpUsername]: {
				on: {
					USERNAME_VALID: {
						target: AuthStateId.SubmittingOtp,
						actions: ["assignUser", "assignUsername", "clearError"],
						description: "System recognises the username: an OTP will have been sent to the user."
					},
					USERNAME_INVALID: {
						target: AuthStateId.SubmittingOtpUsername,
						actions: ["assignError"],
						description: "System does not recognise the username. Remain in this state, and show an error."
					},
				},
				description: "OTP username validation. If successfully submitted, the system will send out an OTP and user can move to the OTP input stage. If not, something is wrong with the username."
			},
			[AuthStateId.SubmittingOtp]: {
				on: {
					OTP_VALID: {
						target: AuthStateId.INTERNAL__deviceSecurityCheck,
						actions: ["clearError", "assignLoginComplete"],
						description: "The user has completed login and will need to set up device security if required.",
					},
					OTP_INVALID: {
						target: AuthStateId.SubmittingOtp,
						actions: ["assignError"],
						description: "The OTP has not been recognised, but the user is allowed to retry."
					},
					OTP_INVALID_RETRIES_EXCEEDED: {
						target: AuthStateId.SubmittingOtpUsername,
						actions: ["assignError"],
						description: "The OTP has not been recognised, and the user has exceeded their maximum number of allowed retries."
					},
					GO_BACK: {
						target: AuthStateId.SubmittingOtpUsername,
						actions: ["clearError", "clearUser", "clearUsername"],
						description: "The user wishes to reenter their username -- they may have realised they mistyped or used an old accout, for example."
					},
				},
				description: "OTP validation. If successfully submitted, the user has completed login and will need to set up device security if required."
			},
			[AuthStateId.SubmittingUsernameAndPassword]: {
				on: {
					USERNAME_AND_PASSWORD_VALID: {
						target: AuthStateId.INTERNAL__deviceSecurityCheck,
						actions: ["assignLoginComplete", "assignUser", "assignUsername", "clearError"],
						description: "The user has completed login and will need to set up device security if required.",
					},
					USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED: {
						target: AuthStateId.SubmittingForceChangePassword,
						actions: ["assignError", "assignUser", "assignUsername"],
						description: "The username and password combination is correct, but the password is only temporary and they must set up a new, secure password."
					},
					USERNAME_AND_PASSWORD_INVALID: {
						target: AuthStateId.SubmittingUsernameAndPassword,
						actions: ["assignError"],
						description: "The username and password combination has not been recognised."
					},
					FORGOTTEN_PASSWORD: {
						target: AuthStateId.ForgottenPasswordRequestingReset,
						actions: ["clearError"],
						description: "The user has forgotten their password and wants to request a reset."
					},
				},
				description: "Username/password validation. If successfully submitted, the user has completed login and will need to set up device security if required."
			},
			[AuthStateId.SubmittingForceChangePassword]: {
				on: {
					PASSWORD_FORCE_CHANGE_SUCCESS: {
						target: AuthStateId.INTERNAL__deviceSecurityCheck,
						actions: ["assignUser", "assignLoginComplete", "clearError"],
						description: "The user has completed login and will need to set up device security if required.",
					},
					PASSWORD_FORCE_CHANGE_FAILURE: {
						target: AuthStateId.SubmittingForceChangePassword,
						actions: ["assignError"],
						description: "The password change request has failed -- it could be due to an invalid password, but the reason is not specified. They will need to try again.",
					},
				},
				description: "Further username/password validation for users who have a temporary password. If successfully submitted, the user has completed login and will need to set up device security if required."
			},
			[AuthStateId.ForgottenPasswordRequestingReset]: {
				on: {
					PASSWORD_RESET_REQUEST_SUCCESS: {
						target: AuthStateId.ForgottenPasswordSubmittingReset,
						actions: ["clearError", "assignUsername"],
						description: "The user confirms they want to reset the password. They only need to enter their username at this point, so will still be able to cancel the request."
					},
					PASSWORD_RESET_REQUEST_FAILURE: {
						target: AuthStateId.ForgottenPasswordRequestingReset,
						actions: ["assignError"],
						description: "The request to reset has failed at the first stage. This indicates that the username has not been recognised."
					},
					GO_BACK: {
						target: AuthStateId.SubmittingUsernameAndPassword,
						actions: ["clearError"],
						description: "The user wishes to cancel the reset request."
					},
				},
			},
			[AuthStateId.ForgottenPasswordSubmittingReset]: {
				on: {
					PASSWORD_RESET_SUCCESS: {
						target: AuthStateId.ForgottenPasswordResetSuccess,
						actions: ["clearError"],
						description: "The user successfully confirms the reset. Once this is done, they cannot cancel."
					},
					PASSWORD_RESET_FAILURE: {
						target: AuthStateId.ForgottenPasswordSubmittingReset,
						actions: ["assignError"],
						description: "The request to reset has failed at the second stage. They will be allowed to retry or cancel.",
					},
					GO_BACK: {
						target: AuthStateId.ForgottenPasswordRequestingReset,
						actions: ["clearError"],
						description: "The user wishes to cancel the reset request."
					},
				},
			},
			[AuthStateId.ForgottenPasswordResetSuccess]: {
				on: {
					CONFIRM_PASSWORD_RESET: {
						target: AuthStateId.SubmittingUsernameAndPassword,
						actions: ["clearUsername"],
						description: "The reset was successful. The user now needs to go through username/password login as normal."
					},
				},
				description: "This state exists to allow contextual text to be displayed to the user, the only action they can take is to confirm they have read the text."
			},
			[AuthStateId.INTERNAL__deviceSecurityCheck]: {
				entry: ["clearError"],
				always: [
					{ cond: "isDeviceSecurityTypeNone", target: AuthStateId.Authenticated },
					{ cond: "isDeviceSecurityTypePin", target: AuthStateId.CheckingForPin },
				],
				description: "Internal state, used for switching flows based on initial config values provided by a client."
			},
			[AuthStateId.CheckingForPin]: {
				on: {
					PIN_IS_SET_UP: [
						{
							cond: "userHasCompletedLogin",
							target: AuthStateId.Authenticated,
							description: "There is a PIN set up, but the user has also completed login flow. This can occur when the session token has expired. In that case, skip to authenticated."
						},
						{
							target: AuthStateId.SubmittingCurrentPin,
							description: "There is a pin set up, but the user has not completed login flow -- i.e. they had a session. They need to enter their PIN."
						},
					],
					PIN_IS_NOT_SET_UP: {
						target: AuthStateId.SubmittingNewPin,
						description: "There is no PIN set up. The user needs to create one.",
					},
				},
				description: "Checks whether a user has a PIN stored locally on the device. This stage should ideally not expose UI beyond loading."
			},
			[AuthStateId.SubmittingCurrentPin]: {
				on: {
					PIN_VALID: {
						target: AuthStateId.Authenticated,
						actions: ["clearError"],
						description: "PIN validates against the one stored on the device. User is authenticated.",
					},
					PIN_INVALID: {
						target: AuthStateId.SubmittingCurrentPin,
						actions: ["assignError"],
						description: "PIN does not validate against the one stored on the device. User must try again."
					},
					REQUEST_PIN_RESET: {
						target: AuthStateId.ForgottenPinRequestingReset,
						actions: ["clearError"],
						description: "User has forgotten their PIN and wishes to request a new one."
					},
				},
			},
			[AuthStateId.ForgottenPinRequestingReset]: {
				on: {
					PIN_RESET_SUCCESS: {
						target: AuthStateId.CheckingSession,
						actions: ["clearError"],
						description: "Resetting PIN. This will log the user out and wipe the current pin. This call should always succeed."
					},
					PIN_RESET_FAILURE: {
						target: AuthStateId.ForgottenPinRequestingReset,
						actions: ["assignError"],
						description: "PIN reset failed. This should never happen. If it does, this indicates an underlying problem with the system."
					},
					CANCEL_PIN_RESET: {
						target: AuthStateId.SubmittingCurrentPin,
						actions: ["clearError"],
						description: "User wishes to cancel the PIN reset."
					},
				},
			},
			[AuthStateId.SubmittingNewPin]: {
				on: {
					NEW_PIN_VALID: {
						target: AuthStateId.Authenticated,
						actions: ["clearError"],
						description: "Attempting to set a new PIN. If the check resolves, attempts was successful and they are now Authenticated. "
					},
					NEW_PIN_INVALID: {
						target: AuthStateId.SubmittingNewPin,
						actions: ["assignError"],
						description: "Failure setting a new PIN. Failure indicates there may be a problem saving the PIN to storage.",
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
				description: "When authenticated, the user now has access to the app itself."
			},
			[AuthStateId.AuthenticatedChangingPassword]: {
				on: {
					PASSWORD_CHANGE_SUCCESS: {
						target: AuthStateId.AuthenticatedPasswordChangeSuccess,
						actions: ["clearError"],
						description: "Attempt to change the current password successful. The user may now return to the Authenticated state.",
					},
					PASSWORD_CHANGE_FAILURE: {
						target: AuthStateId.AuthenticatedChangingPassword,
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
						target: AuthStateId.AuthenticatedValidatingPin,
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
						description: "Attempt to change the current PIN was successful and the user may return to the Authenticated state."
					},
					PIN_CHANGE_FAILURE: {
						target: AuthStateId.AuthenticatedChangingPin,
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
				description: "This state exists to allow contextual text to be displayed to the user, the only action they can take is to confirm they have read the text."
			},
			[AuthStateId.AuthenticatedLoggingOut]: {
				on: {
					LOG_OUT_SUCCESS: {
						target: AuthStateId.CheckingSession,
						description: "Logged out. This call should always succeed.",
					},
					LOG_OUT_FAILURE: {
						target: AuthStateId.AuthenticatedLoggingOut,
						actions: ["assignError"],
						description: "Logout failed. This should not happen: if it does, then there is an underlying issue with the system."
					},
					CANCEL_LOG_OUT: {
						target: AuthStateId.Authenticated,
						description: "Cancelling at this stage simply takes the user back to the Authenticated state.",
					},
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
	return machine.withContext({
		allowedOtpRetries,
		deviceSecurityType,
		loginCompleted: false,
		loginFlowType,
		pinLength
	});
}
