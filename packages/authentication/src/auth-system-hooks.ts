/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";

import { AuthStateId } from "./auth-system";
import { useAuthInterpreter } from "./AuthSystemProvider";

import type { AuthContext, AuthState } from "./auth-system";
import type * as AuthCb from "./auth-system-hook-callbacks";

/* ========================================================================= *\
 * 1. UTILITY TYPES
 * 2. TYPED SELECTORS
 * 3. AUTH STAGE HOOKS
 * 4. AUTHORISED HOOKS
\* ========================================================================= */

/* ========================================================================= *\
 * 1. UTILITY TYPES
 *
 * These are used internally to tighten the typings for states and state
 * selectors
\* ========================================================================= */

/** Filter on the state ID enum to remove states internal to the FSM */
type ExposedStateId = Exclude<
	AuthStateId,
	AuthStateId.INTERNAL__deviceSecurityCheck | AuthStateId.INTERNAL__loginFlowCheck
>;

/** Filter on the state ID enum to extract states only useful when a user is authenticated. */
type AuthenticatedStateId = Extract<
	AuthStateId,
	| AuthStateId.authenticated
	| AuthStateId.loggingOut
	| AuthStateId.awaitingChangePassword
	| AuthStateId.awaitingChangePinInput
>;

/* ========================================================================= *\
 * 2. TYPED SELECTORS
 *
 * To acess the state of the authentication FSM, selectors are being used
 * instead of just exposing all the state all the time via the provider.
 * This gives performance benefits -- it means components using the hooks
 * will only rerender when a selector value changes, which is important
 * for React Native in particular.
 * 
 * See https://xstate.js.org/docs/recipes/react.html#global-state-react-context
\* ========================================================================= */

/**
 * Mapped type to build out the object containing state selector functions.
 * It should ensure TS will error if any state exposed to users has been omitted.
 */
type ExposedStateSelectorMap = {
	[K in `is${Capitalize<ExposedStateId>}`]: (state: AuthState) => boolean;
};

/** Map of every state exposed to users -> match function for that state (_ie_ `true` if in state) */
// prettier-ignore
const stateSelectors: ExposedStateSelectorMap = {
	isAwaitingSessionCheck: (state) => state.matches(AuthStateId.awaitingSessionCheck),
	isAwaitingOtpUsername: (state) => state.matches(AuthStateId.awaitingOtpUsername),
	isAwaitingOtp: (state) => state.matches(AuthStateId.awaitingOtp),
	isAwaitingUsernameAndPassword: (state) => state.matches(AuthStateId.awaitingUsernameAndPassword),
	isAwaitingForcedChangePassword: (state) => state.matches(AuthStateId.awaitingForcedChangePassword),
	isAwaitingChangePassword: (state) => state.matches(AuthStateId.awaitingChangePassword),
	isAwaitingPasswordResetRequest: (state) => state.matches(AuthStateId.awaitingPasswordResetRequest),
	isAwaitingPasswordResetSubmission: (state) => state.matches(AuthStateId.awaitingPasswordResetSubmission),
	isPinChecks: (state) => state.matches(AuthStateId.pinChecks),
	isAwaitingCurrentPinInput: (state) => state.matches(AuthStateId.awaitingCurrentPinInput),
	isAwaitingNewPinInput: (state) => state.matches(AuthStateId.awaitingNewPinInput),
	isAwaitingChangePinInput: (state) => state.matches(AuthStateId.awaitingChangePinInput),
	isResettingPin: (state) => state.matches(AuthStateId.resettingPin),
	isLoggingOut: (state) => state.matches(AuthStateId.loggingOut),
	isAuthenticated: (state) => state.matches(AuthStateId.authenticated),
};

/** Selector specifically for states only useful when a user is authenticated. */
const isInStateAccessibleWhileAuthenticated = (state: AuthState): boolean => {
	return (
		state.matches<AuthenticatedStateId>(AuthStateId.authenticated) ||
		state.matches<AuthenticatedStateId>(AuthStateId.awaitingChangePinInput) ||
		state.matches<AuthenticatedStateId>(AuthStateId.awaitingChangePassword) ||
		state.matches<AuthenticatedStateId>(AuthStateId.loggingOut)
	);
};

/**
 * Mapped type to build out the object containing context value access functions.
 * It should ensure that TS will error if a context value has been omitted or a
 * nonexistant key has been used.
 */
type ContextSelectorMap<S = AuthState, C = AuthContext> = Record<keyof C, (state: S) => C[keyof C]>;

/** Map of every context value as a selector function. */
const contextSelectors: ContextSelectorMap = {
	error: (state) => state.context.error,
	loginFlowType: (state) => state.context.loginFlowType,
	deviceSecurityType: (state) => state.context.loginFlowType,
	user: (state) => state.context.user,
	username: (state) => state.context.username,
};

/* ========================================================================= *\
 * 3. AUTH STAGE HOOKS
 *
 * These hooks cover all stages of the authentication process where a user
 * is **not** authenticated. They all follow a common pattern, taking a
 * callback of a specified shape which is then executed by the hook, allowing
 * us to specify exactly when events will be sent into the FSM system.
\* ========================================================================= */
export function useAwaitingSessionCheck(cb: AuthCb.CheckSessionCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAwaitingSessionCheck!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const checkSession = useCallback(async () => {
		setIsLoading(true);
		// prettier-ignore
		logger.info("Session check initiated: if it resolves, there is a session present. If not, move to login.");
		try {
			const res = await cb();
			logger.info("Session present");
			logger.log(res);
			authenticator.send({ type: "SESSION_PRESENT" });
		} catch (err) {
			logger.info("No session present");
			logger.warn(err);
			authenticator.send({ type: "SESSION_NOT_PRESENT" });
		} finally {
			setIsLoading(false);
		}
	}, [authenticator, error, isActive, isLoading]);

	return {
		error,
		isActive,
		isLoading,
		checkSession,
	};
}

export function useAwaitingOtpUsername<User = any>(cb: AuthCb.ValidateOtpUsernameCb<User>) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAwaitingOtpUsername!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const validateUsername = useCallback(
		async (username: string) => {
			setIsLoading(true);
			// prettier-ignore
			logger.info("OTP username validation initiated: if it resolves, the system will send out an OTP and user can move to the OTP input stage. If not, something is wrong with the username.");

			try {
				const user = await cb(username);
				logger.log(user);
				logger.info("OTP username valid");
				authenticator.send({ type: "USERNAME_VALID", username, user });
			} catch (err) {
				logger.log(err);
				logger.info("OTP username invalid");
				authenticator.send({ type: "USERNAME_INVALID", error: "USERNAME_INVALID" });
			} finally {
				setIsLoading(false);
			}
		},
		[authenticator, error, isActive, isLoading]
	);

	return {
		error,
		isActive,
		isLoading,
		validateUsername,
	};
}

export function useAwaitingOtp<User = any>(cb: AuthCb.ValidateOtpCb<User>) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAwaitingOtp!);
	const currentUserData = useSelector(authenticator, contextSelectors.user);
	const logger = useLogger();

	const [attemptsMade, setAttemptsMade] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	const validateOtp = useCallback(
		async (password) => {
			setIsLoading(true);
			const currentAttempts = attemptsMade + 1;
			// prettier-ignore
			logger.info(`OTP validation initiated (attempt ${attemptsMade + 1}): if successful, this stage of authentication is passed. If not, ${attemptsMade + 1 === 3 ? "system will require username input again" : "system will allow a retry"}.`);

			try {
				const user = await cb(currentUserData, password);
				logger.log(user);
				authenticator.send({ type: "OTP_VALID" });
			} catch (err) {
				logger.log(err);
				if (currentAttempts >= 3) {
					logger.warn(err);
					logger.info("OTP retries exceeded");
					authenticator.send({
						type: "OTP_INVALID_RETRIES_EXCEEDED",
						error: "PASSWORD_RETRIES_EXCEEDED",
					});
					setAttemptsMade(0);
				} else {
					logger.warn(err);
					logger.info(`OTP invalid, ${3 - currentAttempts} tries remaining`);
					authenticator.send({
						type: "OTP_INVALID",
						error: `PASSWORD_INVALID_${3 - currentAttempts}_RETRIES_REMAINING`,
					});
					setAttemptsMade(currentAttempts);
				}
			} finally {
				setIsLoading(false);
			}
		},
		[attemptsMade, authenticator, currentUserData, error, isActive, isLoading]
	);

	const goBack = () => authenticator.send({ type: "GO_BACK" });

	return {
		error,
		isActive,
		isLoading,
		attemptsMade,
		validateOtp,
		goBack,
	};
}

/**
 * TODO: extract info from user object. This, for Cognito, will be the `challengeName`
 * getter property on the returned user object.
 */
function newPasswordIsRequired<User = any>(user: User) {
	return "NEW_PASSWORD_REQUIRED" in user;
}

export function useAwaitingUsernameAndPassword<User = any>(
	cb: AuthCb.ValidateUsernameAndPasswordCb<User>
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAwaitingUsernameAndPassword!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const validateUsernameAndPassword = useCallback(
		async (username, password) => {
			setIsLoading(true);

			try {
				const user = await cb(username, password);
				logger.log(user);
				if (newPasswordIsRequired(user)) {
					authenticator.send({
						type: "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED",
						user,
						username,
						error: "PASSWORD_CHANGE_REQUIRED",
					});
				} else {
					authenticator.send({ type: "USERNAME_AND_PASSWORD_VALID", user, username });
				}
			} catch (err) {
				logger.log(err);
				// REVIEW check errors here to see if can tell if username or password are individually invalid:
				authenticator.send({
					type: "USERNAME_AND_PASSWORD_INVALID",
					error: "USERNAME_AND_PASSWORD_INVALID",
				});
			} finally {
				setIsLoading(false);
			}
		},
		[authenticator, isActive]
	);

	const forgottenPassword = () => {
		authenticator.send({ type: "FORGOTTEN_PASSWORD" });
	};

	return {
		error,
		isActive,
		isLoading,
		validateUsernameAndPassword,
		forgottenPassword,
	};
}

export function useAwaitingForcedChangePassword<User = any>(
	cb: AuthCb.ValidateForceChangePasswordCb<User>
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAwaitingForcedChangePassword!);
	const currentUserData = useSelector(authenticator, contextSelectors.user);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const validateNewPassword = useCallback(
		async (password) => {
			setIsLoading(true);

			try {
				const user = await cb(currentUserData, password);
				logger.log(user);
				authenticator.send({ type: "PASSWORD_CHANGE_SUCCESS" });
			} catch (err) {
				logger.log(err);
				authenticator.send({ type: "PASSWORD_CHANGE_FAILURE", error: "PASSWORD_CHANGE_FAILURE" });
			} finally {
				setIsLoading(false);
			}
		},
		[authenticator, isActive]
	);

	return {
		error,
		isActive,
		isLoading,
		validateNewPassword,
	};
}

/**
 * To request a new password, a user must submit their username. At this point, the username
 * is not stored anywhere, so the screen just needs to accept that. On success, the username
 * will be stored, to be passed onto the next request (submitting a new password + the confirmation
 * code they have been sent).
 */
export function useAwaitingPasswordResetRequest(cb: AuthCb.RequestNewPasswordCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAwaitingPasswordResetRequest!);
	const username = useSelector(authenticator, contextSelectors.username);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const requestNewPassword = useCallback(async () => {
		setIsLoading(true);

		try {
			const res = await cb(username);
			logger.log(res);
			authenticator.send({ type: "PASSWORD_RESET_REQUEST_SUCCESS", username });
		} catch (err) {
			logger.log(err);
			authenticator.send({
				type: "PASSWORD_RESET_REQUEST_FAILURE",
				error: "PASSWORD_RESET_REQUEST_FAILURE",
			});
		} finally {
			setIsLoading(false);
		}
	}, [authenticator, isActive]);

	return {
		error,
		isActive,
		isLoading,
		requestNewPassword,
	};
}

export function useAwaitingPasswordResetSubmission(cb: AuthCb.SubmitNewPasswordCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAwaitingPasswordResetSubmission!);
	const username = useSelector(authenticator, contextSelectors.username);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const submitNewPassword = useCallback(
		async (code: string, newPassword: string) => {
			setIsLoading(true);

			try {
				const res = await cb(username, code, newPassword);
				logger.log(res);
				authenticator.send({ type: "PASSWORD_RESET_SUCCESS" });
			} catch (err) {
				logger.log(err);
				authenticator.send({ type: "PASSWORD_RESET_FAILURE", error: "PASSWORD_RESET_FAILURE" });
			} finally {
				setIsLoading(false);
			}
		},
		[authenticator, isActive]
	);

	return {
		error,
		isActive,
		isLoading,
		submitNewPassword,
	};
}

/**
 * Given the `CheckForExistingPin` callback, the stage should test for existence
 * of a pin. From this, can infer whether the system should move the user to
 * inputting their current PIN or creating a new one.
 */
export function usePinChecks(cb: AuthCb.CheckForExistingPinCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isPinChecks!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const checkForExistingPin = useCallback(async () => {
		setIsLoading(true);
		// prettier-ignore
		logger.info("Initiating a check for an existing PIN. If the check resolves, user has a pin to validate. If not, they will need to create one.");

		try {
			const res = await cb();
			logger.log(res);
			logger.info("There is a PIN already stored on the device.");
			authenticator.send({ type: "PIN_IS_SET_UP" });
		} catch (err) {
			logger.warn(err);
			logger.info("There is no PIN stored on this device.");
			authenticator.send({ type: "PIN_IS_NOT_SET_UP" });
		} finally {
			setIsLoading(false);
		}
	}, [authenticator, isActive]);

	return {
		error,
		isActive,
		isLoading,
		checkForExistingPin,
	};
}

export function useAwaitingCurrentPinInput(cb: AuthCb.ValidatePinCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAwaitingCurrentPinInput!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const validatePin = useCallback(
		async (pin: string) => {
			setIsLoading(true);
			// prettier-ignore
			logger.info("Initiating a check against the existing PIN. If the check resolves, user passes authentication.");

			try {
				const res = await cb(pin);
				logger.log(res);
				logger.info("PIN validated");
				authenticator.send({ type: "PIN_VALID" });
			} catch (err) {
				logger.warn(err);
				logger.warn("PIN validation failed");
				authenticator.send({ type: "PIN_INVALID", error: "PIN_INVALID" });
			} finally {
				setIsLoading(false);
			}
		},
		[authenticator, isActive]
	);

	const requestPinReset = () => authenticator.send({ type: "REQUEST_PIN_RESET" });

	return {
		error,
		isActive,
		isLoading,
		validatePin,
		requestPinReset,
	};
}

export function useResettingPin(cb: AuthCb.LogoutCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isResettingPin!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const resetPin = useCallback(async () => {
		// prettier-ignore
		logger.info("Resetting PIN. This will log the user out and wipe the current pin. This call should always succeed: if it hasn't then there is an underlying issue with the system.");
		setIsLoading(true);

		try {
			const res = await cb();
			logger.log(res);
			logger.info("Pin reset, logged out!");
			authenticator.send({ type: "PIN_RESET_SUCCESS" });
		} catch (err) {
			logger.error(err);
			logger.error(
				"There has been an issue logging out. This should not have occured, so this indicates a serious underlying issue with the system."
			);
			authenticator.send({ type: "PIN_RESET_FAILURE", error: "PIN_RESET_FAILURE" });
		} finally {
			setIsLoading(false);
		}
	}, [authenticator, error, isActive, isLoading]);

	const cancelResetPin = () => authenticator.send({ type: "CANCEL_PIN_RESET" });

	return {
		error,
		isActive,
		isLoading,
		resetPin,
		cancelResetPin,
	};
}

export function useAwaitingNewPinInput(cb: AuthCb.SetNewPinCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAwaitingNewPinInput!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const setNewPin = useCallback(
		async (pin: string) => {
			setIsLoading(true);
			// prettier-ignore
			logger.info("Attempting to set a new PIN. If the check resolves, attempts was successful and they are now authenticated. If it fails there may be a problem with saving to storage.");

			try {
				const res = await cb(pin);
				logger.log(res);
				logger.info("New PIN successfully set.");
				authenticator.send({ type: "NEW_PIN_VALID" });
			} catch (err) {
				logger.warn(err);
				logger.warn("Set PIN action failed.");
				authenticator.send({ type: "NEW_PIN_INVALID", error: "NEW_PIN_INVALID" });
			} finally {
				setIsLoading(false);
			}
		},
		[authenticator, isActive]
	);

	return {
		error,
		isActive,
		isLoading,
		setNewPin,
	};
}

/* ========================================================================= *\
 * 4. AUTHORISED HOOKS
 *
 * These hooks cover all stages of the authentication process where a user
 * **is** authenticated (or, in the case of `isAuthenticated`, one or the other).
 * 
 * Bar the core `isAuthenticated` hook, these still follow the common pattern,
 * with a callback of a specified shape which is then executed by the hook, allowing
 * us to specify exactly when events will be sent into the FSM system.
 * 
 * However, withing the application, these are likely to be tied into the
 * navigation far more than the auth stage hooks.
\* ========================================================================= */

export function useAuthenticated() {
	const authenticator = useAuthInterpreter();
	const isActive = useSelector(authenticator, stateSelectors.isAuthenticated!);
	const isAuthenticated = useSelector(authenticator, isInStateAccessibleWhileAuthenticated);

	const requestLogOut = () => authenticator.send({ type: "REQUEST_LOG_OUT" });
	const requestPasswordChange = () => authenticator.send({ type: "REQUEST_PASSWORD_CHANGE" });
	const requestPinChange = () => authenticator.send({ type: "REQUEST_PIN_CHANGE" });

	return {
		isActive,
		isAuthenticated,
		requestLogOut,
		requestPasswordChange,
		requestPinChange,
	};
}

export function useAwaitingChangePassword(cb: AuthCb.ChangePasswordCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAwaitingChangePassword!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const submitNewPassword = useCallback(
		async (oldPassword: string, newPassword: string) => {
			setIsLoading(true);

			try {
				const res = await cb(oldPassword, newPassword);
				logger.log(res);
				authenticator.send({ type: "PASSWORD_CHANGE_SUCCESS" });
			} catch (err) {
				logger.log(err);
				authenticator.send({ type: "PASSWORD_CHANGE_FAILURE", error: "PASSWORD_CHANGE_FAILURE" });
			} finally {
				setIsLoading(false);
			}
		},
		[authenticator, isActive]
	);

	const cancelChangePassword = () => authenticator.send({ type: "CANCEL_PASSWORD_CHANGE" });

	return {
		error,
		isActive,
		isLoading,
		submitNewPassword,
		cancelChangePassword,
	};
}

export function useAwaitingChangePinInput(cb: AuthCb.ChangePinCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAwaitingChangePinInput!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const changePin = useCallback(
		async (oldPin: string, newPin: string) => {
			setIsLoading(true);
			// prettier-ignore
			logger.info("Attempting to change the current PIN. If the check resolves, attempts was successful and they may return to the authenticated state.");

			try {
				const res = await cb(oldPin, newPin);
				logger.log(res);
				logger.log("PIN change succeeded");
				authenticator.send({ type: "PIN_CHANGE_SUCCESS" });
			} catch (err) {
				logger.warn(err);
				logger.warn("PIN change failed");
				authenticator.send({ type: "PIN_CHANGE_FAILURE", error: "PIN_CHANGE_FAILURE" });
			} finally {
				setIsLoading(false);
			}
		},
		[authenticator, isActive]
	);

	const cancelChangePin = () => authenticator.send({ type: "CANCEL_PIN_CHANGE" });

	return {
		error,
		isActive,
		isLoading,
		changePin,
		cancelChangePin,
	};
}

export function useLoggingOut(cb: AuthCb.LogoutCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isLoggingOut!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const logOut = useCallback(async () => {
		// prettier-ignore
		logger.info("Logging out. This call should always succeed: if it hasn't then there is an underlying issue with the system.");
		setIsLoading(true);

		try {
			const res = await cb();
			logger.log(res);
			logger.info("Logged out!");
			authenticator.send({ type: "LOG_OUT_SUCCESS" });
		} catch (err) {
			logger.error(err);
			logger.error(
				"There has been an issue logging out. This should not have occured, so this indicates a serious underlying issue with the system."
			);
			authenticator.send({ type: "LOG_OUT_FAILURE", error: "LOG_OUT_FAILURE" });
		} finally {
			setIsLoading(false);
		}
	}, [authenticator, error, isActive, isLoading]);

	const cancelLogOut = () => authenticator.send({ type: "CANCEL_LOG_OUT" });

	return {
		error,
		isActive,
		isLoading,
		logOut,
		cancelLogOut,
	};
}
