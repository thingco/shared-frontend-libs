/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";

import { useAuthInterpreter } from "./AuthSystemProvider";
import { stateSelectors, contextSelectors } from "./selectors";

import type { LogoutCb } from "./callback-types";

/**
 * When a user wishes to log out, they first send a _request_ for this. Then the
 * system switches to this state, where the actual logout request can be made
 * against the API. This is done to a. allow cancellation of the logout request and
 * b. allow for a screen/modal with contextual information and logout/cancel logout controls.
 *
 * @param cb - an async function that should execute logout against the API & clear the users PIN
 */
export function useAuthenticatedLoggingOut(cb: LogoutCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isAuthenticatedLoggingOut!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const logOut = useCallback(async () => {
		// prettier-ignore
		logger.info("Logging out. This call should always succeed: if it hasn't then there is an underlying issue with the system.");
		setIsLoading(true);

		try {
			const res = await cb();
			logger.log(res);
			logger.info("Logged out!");
			setIsLoading(false);
			authenticator.send({ type: "LOG_OUT_SUCCESS" });
		} catch (err) {
			logger.error(err);
			logger.error(
				"There has been an issue logging out. This should not have occured, so this indicates a serious underlying issue with the system."
			);
			setIsLoading(false);
			authenticator.send({ type: "LOG_OUT_FAILURE", error: "LOG_OUT_FAILURE" });
		}
	}, [authenticator, error, isActive, isLoading]);

	const cancelLogOut = () => authenticator.send({ type: "CANCEL_LOG_OUT" });

	return {
		error,
		isActive,
		isLoading,
		logOut,
		cancelLogOut,
	};
}
