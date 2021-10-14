/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useSelector } from "@xstate/react";

import { useAuthInterpreter } from "./AuthSystemProvider";
import { stateSelectors, isInStateAccessibleWhileAuthenticated } from "./selectors";

/**
 * The core authenticated state. Most of the app will be in this state, so this hook
 * can be used anywhere past the login flow to provide the methods required to log out,
 * and request password/PIN changes.
 *
 * NOTE: the hook also returns a general `isAuthenticated` boolean property: this is
 * provided as a utility to ensure components using the log out/change requests render
 * even though they technically move out of "authenticated" state.
 */
export function useAuthenticated() {
	const authenticator = useAuthInterpreter();
	const isActive = useSelector(authenticator, stateSelectors.isAuthenticated!);
	const isAuthenticated = useSelector(authenticator, isInStateAccessibleWhileAuthenticated);

	const requestLogOut = () => authenticator.send({ type: "REQUEST_LOG_OUT" });
	const requestPasswordChange = () => authenticator.send({ type: "REQUEST_PASSWORD_CHANGE" });
	const requestPinChange = () => authenticator.send({ type: "REQUEST_PIN_CHANGE" });

	return {
		isActive,
		isAuthenticated,
		requestLogOut,
		requestPasswordChange,
		requestPinChange,
	};
}
