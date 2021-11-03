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
 * @category React
 */
export function useSubmittingOtp<User = any>(
	cb: ValidateOtpCb<User>,
	validators: { password: InputValidationPattern[] } = { password: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isSubmittingOtp!);
	const currentUserData = useSelector(authenticator, contextSelectors.user);
	const allowedRetries = useSelector(authenticator, contextSelectors.allowedOtpRetries);
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
				logger.info(
					`OTP validation initiated (attempt ${
						attemptsMade + 1
					}): if successful, this stage of authentication is passed. If not, ${
						attemptsMade + 1 === allowedRetries
							? "system will require username input again"
							: "system will allow a retry"
					}.`
				);

				const handleError = (err: string) => {
					logger.log(err);
					if (currentAttempts >= allowedRetries) {
						logger.log(`OTP retries exceeded. API error: ${JSON.stringify(err)}`);
						setIsLoading(false);
						authenticator.send({
							type: "OTP_INVALID_RETRIES_EXCEEDED",
							error: "PASSWORD_RETRIES_EXCEEDED",
						});
						setAttemptsMade(0);
					} else {
						logger.log(
							`OTP invalid, ${
								allowedRetries - currentAttempts
							} tries remaining. API error: ${JSON.stringify(err)}`
						);
						setIsLoading(false);
						authenticator.send({
							type: "OTP_INVALID",
							error: `PASSWORD_INVALID_${3 - currentAttempts}_RETRIES_REMAINING`,
						});
						setAttemptsMade(currentAttempts);
					}
				};

				await cb(currentUserData, password)
					.then((user: any) => {
						logger.log(`OTP validate! API reponse: ${JSON.stringify(user)}`);
						if (user.signInUserSession) {
							setIsLoading(false);
							setAttemptsMade(0);
							authenticator.send({ type: "OTP_VALID" });
						} else {
							handleError("Invalid Session");
						}
					})
					.catch(handleError);
				// TODO: This is likely not an error caused by the user
				// So we might want to handle it differently
			}
		},
		[attemptsMade, authenticator, currentUserData, error, isActive, isLoading, validationErrors]
	);

	const goBack = () => {
		setAttemptsMade(0);
		return authenticator.send({ type: "GO_BACK" });
	};

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
