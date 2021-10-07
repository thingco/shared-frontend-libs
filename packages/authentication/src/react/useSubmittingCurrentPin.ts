/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";

import { useAuthInterpreter } from "./AuthSystemProvider";
import { stateSelectors, contextSelectors } from "./selectors";
import { validateInputs } from "./input-validation";

import type { ValidatePinCb } from "./callback-types";
import type { InputValidationPattern } from "./input-validation";

/**
 * If user has a session (i.e. the session check that kicks off the auth resolved,
 * and the user has skipped past login), and device security is turned on for the
 * app, then they end up here, where the exposed methods allow them to either
 * submit their current PIN or indicate they've forgotten it & have it reset.
 *
 * @param cb - an async function that accepts the current pin.
 * @param validators - an optional map of validation patterns
 */
export function useSubmittingCurrentPin(
	cb: ValidatePinCb,
	validators: { pin: InputValidationPattern[] } = { pin: [] }
) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isSubmittingCurrentPin!);
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
				// prettier-ignore
				logger.info("Initiating a check against the existing PIN. If the check resolves, user passes authentication.");

				try {
					const res = await cb(pin);
					logger.log(res);
					logger.info("PIN validated");
					setIsLoading(false);
					authenticator.send({ type: "PIN_VALID" });
				} catch (err) {
					logger.log(err);
					logger.log("PIN validation failed");
					setIsLoading(false);
					authenticator.send({ type: "PIN_INVALID", error: "PIN_INVALID" });
				}
			}
		},
		[authenticator, error, isActive, isLoading, validationErrors]
	);

	const requestPinReset = () => authenticator.send({ type: "REQUEST_PIN_RESET" });

	return {
		error,
		isActive,
		isLoading,
		validatePin,
		validationErrors,
		requestPinReset,
	};
}
