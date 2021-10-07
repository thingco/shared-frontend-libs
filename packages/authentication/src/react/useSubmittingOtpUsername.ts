/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";

import { useAuthInterpreter } from "./AuthSystemProvider";
import { stateSelectors, contextSelectors } from "./selectors";
import { validateInputs } from "./input-validation";

import type { ValidateOtpUsernameCb } from "./callback-types";
import type { InputValidationPattern } from "./input-validation";

/**
 * First stage of OTP authentication: user submits their username, which will be an email
 * address or a phonenumber, and the system can send send an OTP to that email.
 *
 * @param cb - an async function that accepts a username and sends a code to that user.
 * @param validators -  an optional map of validation patterns: `{ username: { pattern: RegExp, failureMessage: string }[] }`
 */
export function useSubmittingOtpUsername<User = any>(
	cb: ValidateOtpUsernameCb<User>,
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
					setIsLoading(false);
					authenticator.send({ type: "USERNAME_VALID", username, user });
				} catch (err) {
					logger.log(err);
					logger.info("OTP username invalid");
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
