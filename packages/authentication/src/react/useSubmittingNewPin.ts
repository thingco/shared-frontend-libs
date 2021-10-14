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
 * If user did not have a session (i.e. the session check that kicks off the auth rejected,
 * and the user has had to go through login), and device security is turned on for the
 * app, then they end up here, where they set up a new PIN.
 *
 * @category React
 */
export function useSubmittingNewPin(
	cb: SetNewPinCb,
	validators: { pin: InputValidationPattern[] } = { pin: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isSubmittingNewPin!);
	const logger = useLogger();

	const [validationErrors, setValidationErrors] = useState<{ pin: string[] }>({ pin: [] });
	const [isLoading, setIsLoading] = useState(false);

	const setNewPin = useCallback(
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
					"Attempting to set a new PIN. If the check resolves, attempts was successful and they are now Authenticated. If it fails there may be a problem with saving to storage."
				);
				try {
					const res = await cb(pin);
					logger.info(`New PIN successfully set. API response: ${JSON.stringify(res)}`);
					setIsLoading(false);
					authenticator.send({ type: "NEW_PIN_VALID" });
				} catch (err) {
					logger.log(`Set PIN action failed. API error: ${JSON.stringify(err)}`);
					setIsLoading(false);
					authenticator.send({ type: "NEW_PIN_INVALID", error: "NEW_PIN_INVALID" });
				}
			}
		},
		[authenticator, isActive, isLoading, error, validationErrors]
	);

	return {
		error,
		isActive,
		isLoading,
		setNewPin,
		validationErrors,
	};
}
