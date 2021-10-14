/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";

import { useAuthInterpreter } from "./AuthSystemProvider";
import { stateSelectors, contextSelectors } from "./selectors";

import type { LogoutCb } from "./callback-types";

/**
 * If user has forgotten their PIN, then this handles resetting it. We don't do
 * anything clever here, we just run log out logic, which takes the user right
 * back to the start. This is a pretty blunt security mechanism: if they are a
 * bad actor & have access to a device where there is a session present for the app,
 * then we want to ensure that they need to go back through login in full. And
 * going through the login in full means setting a new PIN. So just blow everything
 * away: this state allows for UI with context-specific messages + a way to cancel
 * the request before it happens.
 *
 * @category React
 */
export function useForgottenPinRequestingReset(cb: LogoutCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isForgottenPinRequestingReset!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const resetPin = useCallback(async () => {
		logger.info(
			"Resetting PIN. This will log the user out and wipe the current pin. This call should always succeed: if it hasn't then there is an underlying issue with the system."
		);
		setIsLoading(true);

		try {
			const res = await cb();
			logger.log(`Pin reset, logged out! API response: ${JSON.stringify(res)}`);
			setIsLoading(false);
			authenticator.send({ type: "PIN_RESET_SUCCESS" });
		} catch (err) {
			logger.error(
				`There has been an issue logging out. This should not have occured, so this indicates a serious underlying issue with the system. API error: ${JSON.stringify(
					err
				)}`
			);
			setIsLoading(false);
			authenticator.send({ type: "PIN_RESET_FAILURE", error: "PIN_RESET_FAILURE" });
		}
	}, [authenticator, error, isActive, isLoading]);

	const cancelResetPin = () => authenticator.send({ type: "CANCEL_PIN_RESET" });

	return {
		error,
		isActive,
		isLoading,
		resetPin,
		cancelResetPin,
	};
}
