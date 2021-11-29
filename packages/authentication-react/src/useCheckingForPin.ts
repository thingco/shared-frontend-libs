/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";
import { useAuthInterpreter } from "./AuthSystemProvider";
import type { CheckForExistingPinCb } from "./callback-types";
import { contextSelectors, stateSelectors } from "./selectors";



/**
 * Test for for existence of a pin. From this, can infer whether the system
 * should move the user to inputting their current PIN or creating a new one.
 *
 * @category React
 */
export function useCheckingForPin(cb: CheckForExistingPinCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isCheckingForPin!);

	const [isLoading, setIsLoading] = useState(false);

	const checkForExistingPin = useCallback(async () => {
		setIsLoading(true);
		try {
			const _ = await cb();
			setIsLoading(false);
			authenticator.send({ type: "PIN_IS_SET_UP" });
		} catch (err) {
			setIsLoading(false);
			authenticator.send({ type: "PIN_IS_NOT_SET_UP" });
		}
	}, [authenticator, error, isActive, isLoading]);

	return {
		error,
		isActive,
		isLoading,
		checkForExistingPin,
	};
}
