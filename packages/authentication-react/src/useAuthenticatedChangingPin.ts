/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useSelector } from "@xstate/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthInterpreter } from "./AuthSystemProvider";
import type { SetNewPinCb } from "./callback-types";
import type { InputValidationPattern } from "./input-validation";
import { validateInputs } from "./input-validation";
import { contextSelectors, stateSelectors } from "./selectors";


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
	const isMounted = useRef(true);
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAuthenticatedChangingPin!);

	const [validationErrors, setValidationErrors] = useState<{ newPin: string[] }>({ newPin: [] });

	useEffect(() => () => {
		isMounted.current = false;
	}, []);

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
				try {
					const res = await cb(newPin);
					authenticator.send({ type: "PIN_CHANGE_SUCCESS" });
				} catch (err) {
					authenticator.send({ type: "PIN_CHANGE_FAILURE", error: "PIN_CHANGE_FAILURE" });
				} finally {
					if (isMounted.current) setIsLoading(false);
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
