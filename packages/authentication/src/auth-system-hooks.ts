/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";

import { AuthenticationSystemContext, AuthenticationSystemState, AuthStateId } from "./auth-system";
import { useAuthSystem } from "./AuthSystemProvider";

type ExposedStateId = Exclude<
	AuthStateId,
	AuthStateId.INTERNAL__deviceSecurityCheck | AuthStateId.INTERNAL__loginFlowCheck
>;

type ExposedStateSelectorMap = {
	[K in `is${Capitalize<ExposedStateId>}`]: (state: AuthenticationSystemState) => boolean;
};

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
	isLoggingOut: (state) => state.matches(AuthStateId.loggingOut),
	isAuthenticated: (state) => state.matches(AuthStateId.authenticated),
};

type ContextSelectorMap<T = AuthenticationSystemContext> = Record<
	keyof T,
	(state: T) => T[keyof T]
>;

const contextSelectors: ContextSelectorMap = {
	error: (state) => state.error,
	loginFlowType: (state) => state.loginFlowType,
	deviceSecurityType: (state) => state.loginFlowType,
	user: (state) => state.user,
	username: (state) => state.username,
};

/**
 * Check for an active session. Failure of request === no session.
 */
type CheckSessionCb = () => Promise<any>;

export function useAwaitingSessionCheck(cb: CheckSessionCb) {
	const authenticator = useAuthSystem();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAwaitingSessionCheck!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const checkSession = useCallback(async () => {
		setIsLoading(true);
		logger.log("");

		try {
			const res = await cb();
			logger.log(res);
			authenticator.send({ type: "SESSION_PRESENT" });
		} catch (err) {
			logger.log(err);
			authenticator.send({ type: "SESSION_NOT_PRESENT" });
		} finally {
			logger.log("session check made, switching to next state");
			setIsLoading(false);
		}
	}, [authenticator, isActive]);

	return {
		error,
		isActive,
		isLoading,
		checkSession,
	};
}

/**
 * Validate a username when using OTP flow. Success will return a user object, failure
 * means no username found.
 */
type ValidateOtpUsernameCb<User> = (username: string) => Promise<User>;

export function useAwaitingOtpUsername<User = any>(cb: ValidateOtpUsernameCb<User>) {
	const authenticator = useAuthSystem();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAwaitingOtpUsername!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const validateUsername = useCallback(
		async (username: string) => {
			setIsLoading(true);

			try {
				const user = await cb(username);
				logger.log(user);
				authenticator.send({ type: "USERNAME_VALID", username, user });
			} catch (err) {
				logger.log(err);
				authenticator.send({ type: "USERNAME_INVALID", error: "USERNAME_INVALID" });
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
		validateUsername,
	};
}

/**
 * Validate an OTP. Success will return a user object. The user may attempt to enter the
 * OTP a configured number of times (default is three) times; on final failure, they will
 * be bumped back to username input.
 */
type ValidateOtpCb<User> = (user: User, password: string) => Promise<User>;

export function useAwaitingOtp<User = any>(cb: ValidateOtpCb<User>) {
	const authenticator = useAuthSystem();
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

			try {
				const user = await cb(currentUserData, password);
				logger.log(user);
				authenticator.send({ type: "OTP_VALID" });
			} catch (err) {
				logger.log(err);
				if (currentAttempts === 3) {
					logger.log("password tries exceeded");
					authenticator.send({
						type: "OTP_INVALID_RETRIES_EXCEEDED",
						error: "PASSWORD_RETRIES_EXCEEDED",
					});
				} else {
					logger.log(`password invalid, ${3 - currentAttempts} tries remaining`);
					authenticator.send({
						type: "OTP_INVALID",
						error: `PASSWORD_INVALID_${3 - currentAttempts}_RETRIES_REMAINING`,
					});
				}
			} finally {
				setAttemptsMade(currentAttempts);
				setIsLoading(false);
			}
		},
		[authenticator, isActive]
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
 * Validate a username and password together. Success will return a user object, failure
 * means one or both is wrong. The call may also succeed with a return value specifying
 * that the user must change their password: success of this is important, as the user
 * object can be passed to the next stage of authentication.
 */
type ValidateUsernameAndPasswordCb<User> = (username: string, password: string) => Promise<User>;

/**
 * TODO: extract info from user object. This, for Cognito, will be the `challengeName`
 * getter property on the returned user object.
 */
function newPasswordIsRequired<User = any>(user: User) {
	return "NEW_PASSWORD_REQUIRED" in user;
}

export function useAwaitingUsernameAndPassword<User = any>(
	cb: ValidateUsernameAndPasswordCb<User>
) {
	const authenticator = useAuthSystem();
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

/**
 * Validate a new password. The user has already submitted a valid password, but the backend systems
 * require that this be changed: the standard reason would be that a temporary password has been
 * sent out.
 */
type ValidateForceChangePasswordCb<User> = (user: User, password: string) => Promise<User>;

export function useAwaitingForcedChangePassword<User = any>(
	cb: ValidateForceChangePasswordCb<User>
) {
	const authenticator = useAuthSystem();
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
 * Given a username, request a new password for that user. Failure means the call failed,
 * success will trigger the system to send out a reset code to the user's email address.
 */
type RequestNewPasswordCb = (username: string) => Promise<any>;

/**
 * To request a new password, a user must submit their username. At this point, the username
 * is not stored anywhere, so the screen just needs to accept that. On success, the username
 * will be stored, to be passed onto the next request (submitting a new password + the confirmation
 * code they have been sent).
 */
export function useAwaitingPasswordResetRequest(cb: RequestNewPasswordCb) {
	const authenticator = useAuthSystem();
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

/**
 * Submit a new password following a request to reset the current one. The user will
 * have been sent a code after making the reset request, so need to enter that + the new password.
 */
type SubmitNewPasswordCb = (username: string, code: string, newPassword: string) => Promise<any>;

export function useAwaitingPasswordResetSubmission(cb: SubmitNewPasswordCb) {
	const authenticator = useAuthSystem();
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
 * Submit a change password request. For an implemetation, see the Amplify docs here:
 * https://docs.amplify.aws/lib/auth/manageusers/q/platform/js/#change-password
 *
 * The actual `changePassword` function requires the CognitoUser object as the first
 * argument, but because changing password can only occur when a user is logged in, then
 * the CognitoUser object is available by use `Auth.currentAuthenticatedUser`
 */
type ChangePasswordCb = (oldPassword: string, newPassword: string) => Promise<any>;
export function useAwaitingChangePassword(cb: ChangePasswordCb) {
	const authenticator = useAuthSystem();
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

type CheckForExistingPinCb = () => Promise<any>;
export function usePinChecks(cb: CheckForExistingPinCb) {
	const authenticator = useAuthSystem();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isPinChecks!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const checkForExistingPin = useCallback(async () => {
		setIsLoading(true);

		try {
			const res = await cb();
			logger.log(res);
			authenticator.send({ type: "PIN_IS_SET_UP" });
		} catch (err) {
			logger.log(err);
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

type ValidatePinCb = (pin: string) => Promise<any>;

export function useAwaitingCurrentPinInput(cb: ValidatePinCb) {
	const authenticator = useAuthSystem();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isPinChecks!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const validatePin = useCallback(
		async (pin: string) => {
			setIsLoading(true);

			try {
				const res = await cb(pin);
				logger.log(res);
				authenticator.send({ type: "PIN_VALID" });
			} catch (err) {
				logger.log(err);
				authenticator.send({ type: "PIN_INVALID", error: "PIN_INVALID" });
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
		validatePin,
	};
}

type SetNewPinCb = (pin: string) => Promise<any>;

export function useAwaitingNewPinInput(cb: SetNewPinCb) {
	const authenticator = useAuthSystem();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isPinChecks!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const setNewPin = useCallback(
		async (pin: string) => {
			setIsLoading(true);

			try {
				const res = await cb(pin);
				logger.log(res);
				authenticator.send({ type: "NEW_PIN_VALID" });
			} catch (err) {
				logger.log(err);
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

type ChangePinCb = (oldPin: string, newPin: string) => Promise<any>;

export function useAwaitingChangePinInput(cb: ChangePinCb) {
	const authenticator = useAuthSystem();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isPinChecks!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const changePin = useCallback(
		async (oldPin: string, newPin: string) => {
			setIsLoading(true);

			try {
				const res = await cb(oldPin, newPin);
				logger.log(res);
				authenticator.send({ type: "PIN_CHANGE_SUCCESS" });
			} catch (err) {
				logger.log(err);
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

/**
 * Submit a log out request. This shouldn't fail, but we handle the errors just in case.
 */
type LogoutCb = () => Promise<any>;
export function useLoggingOut(cb: LogoutCb) {
	const authenticator = useAuthSystem();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isLoggingOut!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const logOut = useCallback(async () => {
		setIsLoading(true);

		try {
			const res = await cb();
			logger.log(res);
			authenticator.send({ type: "LOG_OUT_SUCCESS" });
		} catch (err) {
			logger.log(err);
			authenticator.send({ type: "LOG_OUT_FAILURE", error: "LOG_OUT_FAILURE" });
		} finally {
			setIsLoading(false);
		}
	}, [authenticator, isActive]);

	const cancelLogOut = () => authenticator.send({ type: "CANCEL_LOG_OUT" });

	return {
		error,
		isActive,
		isLoading,
		logOut,
		cancelLogOut,
	};
}

export function useAuthenticated() {
	const authenticator = useAuthSystem();
	const isActive = useSelector(authenticator, stateSelectors.isAuthenticated!);

	const requestLogOut = () => authenticator.send({ type: "REQUEST_LOG_OUT" });
	const requestPasswordChange = () => authenticator.send({ type: "REQUEST_PASSWORD_CHANGE" });
	const requestPinChange = () => authenticator.send({ type: "REQUEST_PIN_CHANGE" });

	return {
		isActive,
		requestLogOut,
		requestPasswordChange,
		requestPinChange,
	};
}
