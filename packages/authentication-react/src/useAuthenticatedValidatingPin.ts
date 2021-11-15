/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";
import { useAuthInterpreter } from "./AuthSystemProvider";
import type { ValidatePinCb } from "./callback-types";
import type { InputValidationPattern } from "./input-validation";
import { validateInputs } from "./input-validation";
import { contextSelectors, stateSelectors } from "./selectors";



/**
 * When a user is authenticated and they wish to change their PIN, their current
 * PIN must be validated before they can enter a new one.
 *
 * @category React
 */
export function useAuthenticatedValidatingPin(
	cb: ValidatePinCb,
	validators: { pin: InputValidationPattern[] } = { pin: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAuthenticatedValidatingPin!);
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
				logger.info(
					"Initiating a check against the existing PIN. If the check resolves, user passes authentication."
				);

				try {
					const res = await cb(pin);
					logger.log(`PIN validated API response: ${JSON.stringify(res)}`);
					setIsLoading(false);
					authenticator.send({ type: "PIN_VALID" });
				} catch (err) {
					logger.log(`PIN validation failed. API error: ${JSON.stringify(err)}`);
					setIsLoading(false);
					authenticator.send({ type: "PIN_INVALID", error: "PIN_INVALID" });
				}
			}
		},
		[authenticator, error, isActive, isLoading, validationErrors]
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
