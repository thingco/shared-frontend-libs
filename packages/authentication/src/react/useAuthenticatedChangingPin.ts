/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";

import { useAuthInterpreter } from "./AuthSystemProvider";
import { stateSelectors, contextSelectors } from "./selectors";
import { validateInputs } from "./input-validation";

import type { SetNewPinCb } from "./callback-types";
import type { InputValidationPattern } from "./input-validation";

/**
 * When a user is authenticated and they wish to change their PIN, and they have
 * validated their current PIN, they can enter a new one.
 *
 * @category React
 */
export function useAuthenticatedChangingPin(
	cb: SetNewPinCb,
	validators: { newPin: InputValidationPattern[] } = { newPin: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAuthenticatedChangingPin!);
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
				logger.info(
					"Attempting to change the current PIN. If the check resolves, the attempt was successful and they may return to the Authenticated state."
				);
				try {
					const res = await cb(newPin);
					logger.log(`PIN change succeeded. API response: ${JSON.stringify(res)}`);
					setIsLoading(false);
					authenticator.send({ type: "PIN_CHANGE_SUCCESS" });
				} catch (err) {
					logger.log(`PIN change failed. API error: ${JSON.stringify(err)}`);
					setIsLoading(false);
					authenticator.send({ type: "PIN_CHANGE_FAILURE", error: "PIN_CHANGE_FAILURE" });
				}
			}
		},
		[authenticator, isActive, isLoading, error, validationErrors]
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
