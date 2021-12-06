/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useSelector } from "@xstate/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthInterpreter } from "./AuthSystemProvider";
import type { LogoutCb } from "./callback-types";
import { contextSelectors, stateSelectors } from "./selectors";

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
	const isMounted = useRef(true);
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isForgottenPinRequestingReset!);

	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => () => {
		isMounted.current = false;
	}, []);

	const resetPin = useCallback(async () => {
		setIsLoading(true);
		try {
			const res = await cb();
			authenticator.send({ type: "PIN_RESET_SUCCESS" });
		} catch (err) {
			authenticator.send({ type: "PIN_RESET_FAILURE", error: "PIN_RESET_FAILURE" });
		} finally {
			if (isMounted.current) setIsLoading(false);
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
