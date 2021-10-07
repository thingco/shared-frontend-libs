/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";

import { useAuthInterpreter } from "./AuthSystemProvider";
import { stateSelectors, contextSelectors } from "./selectors";

import type { CheckForExistingPinCb } from "./callback-types";

/**
 * Test for for existence of a pin. From this, can infer whether the system
 * should move the user to inputting their current PIN or creating a new one.
 *
 * @param cb - an async function that checks for the existence of a PIN
 */
export function useCheckingForPin(cb: CheckForExistingPinCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isCheckingForPin!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const checkForExistingPin = useCallback(async () => {
		setIsLoading(true);
		// prettier-ignore
		logger.info("Initiating a check for an existing PIN. If the check resolves, user has a pin to validate. If not, they will need to create one.");

		try {
			const res = await cb();
			logger.log(res);
			logger.info("There is a PIN already stored on the device.");
			setIsLoading(false);
			authenticator.send({ type: "PIN_IS_SET_UP" });
		} catch (err) {
			logger.log(err);
			logger.info("There is no PIN stored on this device.");
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
