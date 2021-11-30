/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useSelector } from "@xstate/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthInterpreter } from "./AuthSystemProvider";
import type { SetNewPinCb } from "./callback-types";
import type { InputValidationPattern } from "./input-validation";
import { validateInputs } from "./input-validation";
import { contextSelectors, stateSelectors } from "./selectors";

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
	const isMounted = useRef(true);
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isSubmittingNewPin!);

	const [validationErrors, setValidationErrors] = useState<{ pin: string[] }>({ pin: [] });
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => () => {
		isMounted.current = false;
	}, []);

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
				try {
					const res = await cb(pin);
					authenticator.send({ type: "NEW_PIN_VALID" });
				} catch (err) {
					authenticator.send({ type: "NEW_PIN_INVALID", error: "NEW_PIN_INVALID" });
				} finally {
					if (isMounted.current) setIsLoading(false);
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
