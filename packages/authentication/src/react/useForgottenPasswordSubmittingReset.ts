/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";

import { useAuthInterpreter } from "./AuthSystemProvider";
import { stateSelectors, contextSelectors } from "./selectors";
import { validateInputs } from "./input-validation";

import type { SubmitNewPasswordCb } from "./callback-types";
import type { InputValidationPattern } from "./input-validation";

/**
 * After a user has requested a password reset after indicating they have forgotten
 * their current password, they are send a reset code. This state hook handles
 * submitting that + the new password.
 *
 * @param cb - an async function that accepts the code the user has been sent + a new password.
 * @param validators - an optional map of validation patterns
 */
export function useForgottenPasswordSubmittingReset(
	cb: SubmitNewPasswordCb,
	validators: { code: InputValidationPattern[]; newPassword: InputValidationPattern[] } = {
		code: [],
		newPassword: [],
	}
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isForgottenPasswordSubmittingReset!);
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
					setIsLoading(false);
					authenticator.send({ type: "PASSWORD_RESET_SUCCESS" });
				} catch (err) {
					logger.log(err);
					setIsLoading(false);
					authenticator.send({ type: "PASSWORD_RESET_FAILURE", error: "PASSWORD_RESET_FAILURE" });
				}
			}
		},
		[authenticator, error, isActive, isLoading, username, validationErrors]
	);

	const cancelPasswordReset = () => authenticator.send({ type: "GO_BACK" });

	return {
		error,
		isActive,
		isLoading,
		cancelPasswordReset,
		submitNewPassword,
		validationErrors,
	};
}
