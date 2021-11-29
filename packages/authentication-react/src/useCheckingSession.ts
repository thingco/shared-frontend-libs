/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useSelector } from "@xstate/react";
import { useCallback, useState } from "react";
import { useAuthInterpreter } from "./AuthSystemProvider";
import type { CheckSessionCb } from "./callback-types";
import { contextSelectors, stateSelectors } from "./selectors";

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

	const [isLoading, setIsLoading] = useState(false);

	const checkSession = useCallback(async () => {
		setIsLoading(true);
		try {
			await cb();
			setIsLoading(false);
			authenticator.send({ type: "SESSION_PRESENT" });
		} catch (err) {
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
