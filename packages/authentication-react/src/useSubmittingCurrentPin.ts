/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useSelector } from "@xstate/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthInterpreter } from "./AuthSystemProvider";
import type { ValidatePinCb } from "./callback-types";
import type { InputValidationPattern } from "./input-validation";
import { validateInputs } from "./input-validation";
import { contextSelectors, stateSelectors } from "./selectors";

/**
 * If user has a session (i.e. the session check that kicks off the auth resolved,
 * and the user has skipped past login), and device security is turned on for the
 * app, then they end up here, where the exposed methods allow them to either
 * submit their current PIN or indicate they've forgotten it & have it reset.
 *
 * @category React
 */
export function useSubmittingCurrentPin(
	cb: ValidatePinCb,
	validators: { pin: InputValidationPattern[] } = { pin: [] }
) {
	const isMounted = useRef(true);
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isSubmittingCurrentPin!);

	const [validationErrors, setValidationErrors] = useState<{ pin: string[] }>({ pin: [] });
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => () => {
		isMounted.current = false;
	}, []);

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

				try {
					const res = await cb(pin);
					authenticator.send({ type: "PIN_VALID" });
				} catch (err) {
					authenticator.send({ type: "PIN_INVALID", error: "PIN_INVALID" });
				} finally {
					if (isMounted.current) setIsLoading(false);
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
