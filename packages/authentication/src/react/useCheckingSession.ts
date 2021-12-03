/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";

import { useAuthInterpreter } from "./AuthSystemProvider";
import { stateSelectors, contextSelectors } from "./selectors";

import type { CheckSessionCb } from "./callback-types";

/**
 * The "CheckingSession" state is always the first stage of authentication. If a
 * session is found, can go straight to device security checks (if device security
 * is turned on). If not, the relevant login flow is initiated.
 *
 * @category React
 */
export function useCheckingSession(cb: CheckSessionCb) {
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isCheckingSession!);
	const logger = useLogger();

	const [isLoading, setIsLoading] = useState(false);

	const checkSession = useCallback(async () => {
		setIsLoading(true);
		logger.info("Session check initiated: if it resolves, there is a session present. If not, move to login.");
		try {
			const res = await cb();
			logger.log(`Session present. API response: ${JSON.stringify(res)}`);
			setIsLoading(false);
			authenticator.send({ type: "SESSION_PRESENT" });
		} catch (err) {
			logger.log(`No session present. API error: ${JSON.stringify(err)}`);
			setIsLoading(false);
			authenticator.send({ type: "SESSION_NOT_PRESENT" });
		}
	}, [authenticator, error, isActive, isLoading]);

	return {
		error,
		isActive,
		isLoading,
		checkSession,
	};
}
