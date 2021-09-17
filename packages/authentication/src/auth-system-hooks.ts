/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";

import { useAuthInterpreter } from "./AuthSystemProvider";
import {
	stateSelectors,
	isInStateAccessibleWhileAuthenticated,
	contextSelectors,
} from "./auth-system-selectors";

import type * as AuthCb from "./auth-system-hook-callbacks";

/* ========================================================================= *\
 *
 * 1. INPUT VALIDATION
 * 2. AUTH STAGE HOOKS
 * 3. AUTHORISED HOOKS
\* ========================================================================= */

/* ========================================================================= *\
 * 1. INPUT VALIDATION
 *
 * If the hook accepts an array of input value validators, these need to be
 * applied prior to *any* of the actual callback logic executing, *i.e.* the
 * function needs ot return early, populating the `validationErrors` state
\* ========================================================================= */

export type InputValidationPattern = {
	pattern: RegExp;
	failureMessage: string;
};
type InputValidationsMap = {
	[inputKey: string]: InputValidationPattern[];
};

function validateInputs(
	inputValidations: InputValidationsMap,
	inputValues: {
		[inputKey in keyof InputValidationsMap]: string;
	}
): { [inputKey in keyof InputValidationsMap]: string[] } {
	return Object.fromEntries(
		Object.entries(inputValues).map(([k, v]) => {
			const failedValidations = inputValidations[k]
				.filter(({ pattern }) => !pattern.test(v))
				.map(({ failureMessage }) => failureMessage);

			return [k, failedValidations];
		})
	);
}

/* ========================================================================= *\
 * 2. AUTH STAGE HOOKS
 *
 * These hooks cover all stages of the authentication process where a user
 * is **not** Authenticated. They all follow a common pattern, taking a
 * callback of a specified shape which is then executed by the hook, allowing
 * us to specify exactly when events will be sent into the FSM system.
\* ========================================================================= */
export function useCheckingForSession(cb: AuthCb.CheckSessionCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isCheckingForSession!);
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

export function useSubmittingOtpUsername<User = any>(
	cb: AuthCb.ValidateOtpUsernameCb<User>,
	validators: { username: InputValidationPattern[] } = { username: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isSubmittingOtpUsername!);
	const logger = useLogger();

	const [validationErrors, setValidationErrors] = useState<{ username: string[] }>({
		username: [],
	});
	const [isLoading, setIsLoading] = useState(false);

	const validateUsername = useCallback(
		async (username: string) => {
			const validationErrors = validateInputs(validators, { username });
			if (validationErrors.username.length > 0) {
				setValidationErrors(
					validationErrors as { [inputKey in keyof typeof validators]: string[] }
				);
				return;
			} else {
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
			}
		},
		[authenticator, error, isActive, isLoading]
	);

	return {
		error,
		isActive,
		isLoading,
		validateUsername,
		validationErrors,
	};
}

export function useSubmittingOtp<User = any>(
	cb: AuthCb.ValidateOtpCb<User>,
	validators: { password: InputValidationPattern[] } = { password: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isSubmittingOtp!);
	const currentUserData = useSelector(authenticator, contextSelectors.user);
	const logger = useLogger();

	const [validationErrors, setValidationErrors] = useState<{ password: string[] }>({
		password: [],
	});
	const [attemptsMade, setAttemptsMade] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	const validateOtp = useCallback(
		async (password) => {
			const validationErrors = validateInputs(validators, { password });
			if (validationErrors.password.length > 0) {
				setValidationErrors(
					validationErrors as { [inputKey in keyof typeof validators]: string[] }
				);
				return;
			} else {
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
		validationErrors,
		goBack,
	};
}

export function useSubmittingUsernameAndPassword<User = any>(
	cb: AuthCb.ValidateUsernameAndPasswordCb<User>,
	validators: {
		username: InputValidationPattern[];
		password: InputValidationPattern[];
	} = { username: [], password: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isSubmittingUsernameAndPassword!);
	const logger = useLogger();

	const [validationErrors, setValidationErrors] = useState<{
		username: string[];
		password: string[];
	}>({ username: [], password: [] });
	const [isLoading, setIsLoading] = useState(false);

	const validateUsernameAndPassword = useCallback(
		async (username, password) => {
			const validationErrors = validateInputs(validators, { username, password });
			if (validationErrors.username.length > 0 || validationErrors.password.length > 0) {
				setValidationErrors(
					validationErrors as { [inputKey in keyof typeof validators]: string[] }
				);
				return;
			} else {
				setIsLoading(true);

				try {
					const resp = await cb(username, password);
					logger.log(resp);
					if (Array.isArray(resp) && resp[0] === "NEW_PASSWORD_REQUIRED") {
						authenticator.send({
							type: "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED",
							user: resp[1],
							username,
							error: "PASSWORD_CHANGE_REQUIRED",
						});
					} else {
						authenticator.send({ type: "USERNAME_AND_PASSWORD_VALID", user: resp, username });
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
		validationErrors,
		forgottenPassword,
	};
}

export function useSubmittingForceChangePassword<User = any>(
	cb: AuthCb.ValidateForceChangePasswordCb<User>,
	validators: { password: InputValidationPattern[] } = { password: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isSubmittingForceChangePassword!);
	const currentUserData = useSelector(authenticator, contextSelectors.user);
	const logger = useLogger();

	const [validationErrors, setValidationErrors] = useState<{ password: string[] }>({
		password: [],
	});
	const [isLoading, setIsLoading] = useState(false);

	const validateNewPassword = useCallback(
		async (password) => {
			const validationErrors = validateInputs(validators, { password });
			if (validationErrors.password.length > 0) {
				setValidationErrors(
					validationErrors as { [inputKey in keyof typeof validators]: string[] }
				);
				return;
			} else {
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
			}
		},
		[authenticator, isActive]
	);

	return {
		error,
		isActive,
		isLoading,
		validateNewPassword,
		validationErrors,
	};
}

/**
 * To request a new password, a user must submit their username. At this point, the username
 * is not stored anywhere, so the screen just needs to accept that. On success, the username
 * will be stored, to be passed onto the next request (submitting a new password + the confirmation
 * code they have been sent).
 */
export function useRequestingPasswordReset(
	cb: AuthCb.RequestNewPasswordCb,
	validators: { username: InputValidationPattern[] } = { username: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isRequestingPasswordReset!);
	const logger = useLogger();

	const [validationErrors, setValidationErrors] = useState<{ username: string[] }>({
		username: [],
	});
	const [isLoading, setIsLoading] = useState(false);

	const requestNewPassword = useCallback(
		async (username) => {
			const validationErrors = validateInputs(validators, { username });
			if (validationErrors.username.length > 0) {
				setValidationErrors(
					validationErrors as { [inputKey in keyof typeof validators]: string[] }
				);
				return;
			} else {
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
			}
		},
		[authenticator, isActive]
	);

	const cancelResetPasswordRequest = () => authenticator.send({ type: "GO_BACK" });

	return {
		error,
		isActive,
		isLoading,
		cancelResetPasswordRequest,
		requestNewPassword,
		validationErrors,
	};
}

export function useSubmittingPasswordReset(
	cb: AuthCb.SubmitNewPasswordCb,
	validators: { code: InputValidationPattern[]; newPassword: InputValidationPattern[] } = {
		code: [],
		newPassword: [],
	}
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isSubmittingPasswordReset!);
	const username = useSelector(authenticator, contextSelectors.username);
	const logger = useLogger();

	const [validationErrors, setValidationErrors] = useState<{
		code: string[];
		newPassword: string[];
	}>({ code: [], newPassword: [] });
	const [isLoading, setIsLoading] = useState(false);

	const submitNewPassword = useCallback(
		async (code: string, newPassword: string) => {
			const validationErrors = validateInputs(validators, { code, newPassword });
			if (validationErrors.code.length > 0 || validationErrors.newPassword.length > 0) {
				setValidationErrors(
					validationErrors as { [inputKey in keyof typeof validators]: string[] }
				);
				return;
			} else {
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
			}
		},
		[authenticator, isActive, username]
	);

	return {
		error,
		isActive,
		isLoading,
		submitNewPassword,
		validationErrors,
	};
}

export function usePasswordChangedSuccess() {
	const authenticator = useAuthInterpreter();
	const isActive = useSelector(authenticator, stateSelectors.isPasswordChangedSuccess);

	const confirmPasswordReset = () => authenticator.send({ type: "CONFIRM_PASSWORD_RESET" });
	const confirmPasswordChanged = () => authenticator.send({ type: "CONFIRM_PASSWORD_CHANGE" });

	return {
		isActive,
		confirmPasswordChanged,
		confirmPasswordReset,
	};
}

/**
 * Given the `CheckForExistingPin` callback, the stage should test for existence
 * of a pin. From this, can infer whether the system should move the user to
 * inputting their current PIN or creating a new one.
 */
export function useCheckingForPin(cb: AuthCb.CheckForExistingPinCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isCheckingForPin!);
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

export function useSubmittingCurrentPin(
	cb: AuthCb.ValidatePinCb,
	validators: { pin: InputValidationPattern[] } = { pin: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isSubmittingCurrentPin!);
	const logger = useLogger();

	const [validationErrors, setValidationErrors] = useState<{ pin: string[] }>({ pin: [] });
	const [isLoading, setIsLoading] = useState(false);

	const validatePin = useCallback(
		async (pin: string) => {
			const validationErrors = validateInputs(validators, { pin });
			if (validationErrors.pin.length > 0) {
				setValidationErrors(
					validationErrors as { [inputKey in keyof typeof validators]: string[] }
				);
				return;
			} else {
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
		validationErrors,
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

export function useSubmittingNewPin(
	cb: AuthCb.SetNewPinCb,
	validators: { pin: InputValidationPattern[] } = { pin: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isSubmittingNewPin!);
	const logger = useLogger();

	const [validationErrors, setValidationErrors] = useState<{ pin: string[] }>({ pin: [] });
	const [isLoading, setIsLoading] = useState(false);

	const setNewPin = useCallback(
		async (pin: string) => {
			const validationErrors = validateInputs(validators, { pin });
			if (validationErrors.pin.length > 0) {
				setValidationErrors(
					validationErrors as { [inputKey in keyof typeof validators]: string[] }
				);
				return;
			} else {
				setIsLoading(true);
				// prettier-ignore
				logger.info("Attempting to set a new PIN. If the check resolves, attempts was successful and they are now Authenticated. If it fails there may be a problem with saving to storage.");

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
			}
		},
		[authenticator, isActive]
	);

	return {
		error,
		isActive,
		isLoading,
		setNewPin,
		validationErrors,
	};
}

/* ========================================================================= *\
 * 3. AUTHORISED HOOKS
 *
 * These hooks cover all stages of the authentication process where a user
 * **is** Authenticated (or, in the case of `isAuthenticated`, one or the other).
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

export function useChangingPassword(
	cb: AuthCb.ChangePasswordCb,
	validators: {
		oldPassword: InputValidationPattern[];
		newPassword: InputValidationPattern[];
	} = { oldPassword: [], newPassword: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isChangingPassword!);
	const logger = useLogger();

	const [validationErrors, setValidationErrors] = useState<{
		oldPassword: string[];
		newPassword: string[];
	}>({ oldPassword: [], newPassword: [] });
	const [isLoading, setIsLoading] = useState(false);

	const submitNewPassword = useCallback(
		async (oldPassword: string, newPassword: string) => {
			const validationErrors = validateInputs(validators, { oldPassword, newPassword });
			if (validationErrors.oldPassword.length > 0 || validationErrors.newPassword.length > 0) {
				setValidationErrors(
					validationErrors as { [inputKey in keyof typeof validators]: string[] }
				);
				return;
			} else {
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
		validationErrors,
	};
}

export function useValidatingPin(
	cb: AuthCb.ValidatePinCb,
	validators: { pin: InputValidationPattern[] } = { pin: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isValidatingPin!);
	const logger = useLogger();

	const [validationErrors, setValidationErrors] = useState<{ pin: string[] }>({ pin: [] });
	const [isLoading, setIsLoading] = useState(false);

	const validatePin = useCallback(
		async (pin: string) => {
			const validationErrors = validateInputs(validators, { pin });
			if (validationErrors.pin.length > 0) {
				setValidationErrors(
					validationErrors as { [inputKey in keyof typeof validators]: string[] }
				);
				return;
			} else {
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
			}
		},
		[authenticator, isActive]
	);

	// Need a way to back out of change pin stage
	const cancelChangePin = () => authenticator.send({ type: "CANCEL_PIN_CHANGE" });

	return {
		error,
		isActive,
		isLoading,
		validatePin,
		validationErrors,
		cancelChangePin,
	};
}

export function useChangingPin(
	cb: AuthCb.SetNewPinCb,
	validators: { newPin: InputValidationPattern[] } = { newPin: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isChangingPin!);
	const logger = useLogger();

	const [validationErrors, setValidationErrors] = useState<{ newPin: string[] }>({ newPin: [] });
	const [isLoading, setIsLoading] = useState(false);

	const changePin = useCallback(
		async (newPin: string) => {
			const validationErrors = validateInputs(validators, { newPin });
			if (validationErrors.newPin.length > 0) {
				setValidationErrors(
					validationErrors as { [inputKey in keyof typeof validators]: string[] }
				);
				return;
			} else {
				setIsLoading(true);
				// prettier-ignore
				logger.info("Attempting to change the current PIN. If the check resolves, the attempt was successful and they may return to the Authenticated state.");

				try {
					const res = await cb(newPin);
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
		validationErrors,
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
