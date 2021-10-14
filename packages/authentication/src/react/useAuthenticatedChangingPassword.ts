/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";

import { useAuthInterpreter } from "./AuthSystemProvider";
import { stateSelectors, contextSelectors } from "./selectors";
import { validateInputs } from "./input-validation";

import type { ChangePasswordCb } from "./callback-types";
import type { InputValidationPattern } from "./input-validation";

/**
 * When an authenticated user requests a password change, this state is where the
 * submission of the new password occurs.
 *
 * NOTE: AWS' change password functions require _three_ parameters: the user
 * object for an authenticated user, the old password and the new password. But
 * this hook only expects two. AWS' provides functions to get the user object, and so
 * the callback passed to this must first get that object, then call the change function,
 * and return the result. This is done because there are (deliberately) no safeguards
 * in this codebase to ensure the user object is held in the machine context -- that
 * user object is changeable, so not relying on a possibly-stale object is sensible.
 *
 * @category React
 */
export function useAuthenticatedChangingPassword(
	cb: ChangePasswordCb,
	validators: {
		oldPassword: InputValidationPattern[];
		newPassword: InputValidationPattern[];
	} = { oldPassword: [], newPassword: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAuthenticatedChangingPassword!);
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
				logger.info(
					"Attempting to change the current password. If the check resolves, the attempt was successful and they may return to the Authenticated state."
				);

				try {
					const res = await cb(oldPassword, newPassword);
					logger.log(`Password successfully changed! API response: ${JSON.stringify(res)}`);
					setIsLoading(false);
					authenticator.send({ type: "PASSWORD_CHANGE_SUCCESS" });
				} catch (err) {
					logger.log(`Password change failed! API error: ${JSON.stringify(err)}`);
					setIsLoading(false);
					authenticator.send({ type: "PASSWORD_CHANGE_FAILURE", error: "PASSWORD_CHANGE_FAILURE" });
				}
			}
		},
		[authenticator, isActive, isLoading, error, validationErrors]
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
