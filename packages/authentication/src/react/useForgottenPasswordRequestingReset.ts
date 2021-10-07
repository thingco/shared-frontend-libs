/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";

import { useAuthInterpreter } from "./AuthSystemProvider";
import { stateSelectors, contextSelectors } from "./selectors";
import { validateInputs } from "./input-validation";

import type { RequestNewPasswordCb } from "./callback-types";
import type { InputValidationPattern } from "./input-validation";

/**
 * If a user has forgotten their password, they can request a reset by entering their username.
 * To request a new password, a user must submit their username (this will be an email address).
 * The system will send them a reset code (temporary password, effectively) which can be used
 * alongside a new password they enter when they submit on the next stage.
 *
 * @param cb - an async function that accepts a username
 * @param validators - an optional map of validation patterns
 */
export function useForgottenPasswordRequestingReset(
	cb: RequestNewPasswordCb,
	validators: { username: InputValidationPattern[] } = { username: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isForgottenPasswordRequestingReset!);
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
					setIsLoading(false);
					authenticator.send({ type: "PASSWORD_RESET_REQUEST_SUCCESS", username });
				} catch (err) {
					logger.log(err);
					setIsLoading(false);
					authenticator.send({
						type: "PASSWORD_RESET_REQUEST_FAILURE",
						error: "PASSWORD_RESET_REQUEST_FAILURE",
					});
				}
			}
		},
		[authenticator, error, isActive, isLoading]
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
