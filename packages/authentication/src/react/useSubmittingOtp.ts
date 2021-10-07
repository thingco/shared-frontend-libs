/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";

import { useAuthInterpreter } from "./AuthSystemProvider";
import { stateSelectors, contextSelectors } from "./selectors";
import { validateInputs } from "./input-validation";

import type { ValidateOtpCb } from "./callback-types";
import type { InputValidationPattern } from "./input-validation";

/**
 * After a user has been sent an OTP, this hook handles submitting that.
 * On success, they are authenticated and can move to setting up device security.
 *
 * @param cb - an async function that accepts the one-time password.
 * @param validators - an optional map of validation patterns
 */
export function useSubmittingOtp<User = any>(
	cb: ValidateOtpCb<User>,
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
					setIsLoading(false);
					authenticator.send({ type: "OTP_VALID" });
				} catch (err) {
					logger.log(err);
					if (currentAttempts >= 3) {
						logger.log(err);
						logger.info("OTP retries exceeded");
						setIsLoading(false);
						authenticator.send({
							type: "OTP_INVALID_RETRIES_EXCEEDED",
							error: "PASSWORD_RETRIES_EXCEEDED",
						});
						setAttemptsMade(0);
					} else {
						logger.log(err);
						logger.info(`OTP invalid, ${3 - currentAttempts} tries remaining`);
						setIsLoading(false);
						authenticator.send({
							type: "OTP_INVALID",
							error: `PASSWORD_INVALID_${3 - currentAttempts}_RETRIES_REMAINING`,
						});
						setAttemptsMade(currentAttempts);
					}
				}
			}
		},
		[attemptsMade, authenticator, currentUserData, error, isActive, isLoading, validationErrors]
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
