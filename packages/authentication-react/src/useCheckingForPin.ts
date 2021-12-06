/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useSelector } from "@xstate/react";
import { useCallback, useEffect, useRef, useState } from "react";
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
	const isMounted = useRef(true);
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isCheckingForPin!);

	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => () => {
		isMounted.current = false;
	}, []);

	const checkForExistingPin = useCallback(async () => {
		setIsLoading(true);
		try {
			const _ = await cb();
			authenticator.send({ type: "PIN_IS_SET_UP" });
		} catch (err) {
			authenticator.send({ type: "PIN_IS_NOT_SET_UP" });
		} finally {
			if (isMounted.current) setIsLoading(false);
		}
	}, [authenticator, error, isActive, isLoading]);

	return {
		error,
		isActive,
		isLoading,
		checkForExistingPin,
	};
}
