/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";
import { useAuthInterpreter } from "./AuthSystemProvider";
import type { ValidateOtpUsernameCb } from "./callback-types";
import type { InputValidationPattern } from "./input-validation";
import { validateInputs } from "./input-validation";
import { contextSelectors, stateSelectors } from "./selectors";



/**
 * First stage of OTP authentication: user submits their username, which will be an email
 * address or a phonenumber, and the system can send send an OTP to that email.
 *
 * @category React
 */
export function useSubmittingOtpUsername<User = any>(
	cb: ValidateOtpUsernameCb<User>,
	validators: { username: InputValidationPattern[] } = { username: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isSubmittingOtpUsername!);

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

				try {
					const user = await cb(username);
					setIsLoading(false);
					authenticator.send({ type: "USERNAME_VALID", username, user });
				} catch (err) {
					setIsLoading(false);
					authenticator.send({ type: "USERNAME_INVALID", error: "USERNAME_INVALID" });
				}
			}
		},
		[authenticator, error, isActive, isLoading, validationErrors]
	);

	return {
		error,
		isActive,
		isLoading,
		validateUsername,
		validationErrors,
	};
}
