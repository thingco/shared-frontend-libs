/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useSelector } from "@xstate/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthInterpreter } from "./AuthSystemProvider";
import type { RequestNewPasswordCb } from "./callback-types";
import type { InputValidationPattern } from "./input-validation";
import { validateInputs } from "./input-validation";
import { contextSelectors, stateSelectors } from "./selectors";

/**
 * If a user has forgotten their password, they can request a reset by entering their username.
 * To request a new password, a user must submit their username (this will be an email address).
 * The system will send them a reset code (temporary password, effectively) which can be used
 * alongside a new password they enter when they submit on the next stage.
 *
 * @category React
 */
export function useForgottenPasswordRequestingReset(
	cb: RequestNewPasswordCb,
	validators: { username: InputValidationPattern[] } = { username: [] }
) {
	const isMounted = useRef(true);
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isForgottenPasswordRequestingReset!);

	const [validationErrors, setValidationErrors] = useState<{ username: string[] }>({
		username: [],
	});
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => () => {
		isMounted.current = false;
	}, []);

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
					authenticator.send({ type: "PASSWORD_RESET_REQUEST_SUCCESS", username });
				} catch (err) {
					authenticator.send({
						type: "PASSWORD_RESET_REQUEST_FAILURE",
						error: "PASSWORD_RESET_REQUEST_FAILURE",
					});
				} finally {
					if (isMounted.current) setIsLoading(false);
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
