/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useSelector } from "@xstate/react";
import { useAuthInterpreter } from "./AuthSystemProvider";
import { stateSelectors } from "./selectors";


/**
 * Once a user has successfully changed their password, this intermediate state
 * allows for a modal/screen telling the user everything has updated as expected,
 * and letting them get back to where they were in the app.
 *
 * @category React
 */
export function useAuthenticatedPasswordChangeSuccess() {
	const authenticator = useAuthInterpreter();
	const isActive = useSelector(authenticator, stateSelectors.isAuthenticatedPasswordChangeSuccess!);

	const confirmPasswordChange = () => {
		authenticator.send({ type: "CONFIRM_PASSWORD_CHANGE" });
	};

	return {
		isActive,
		confirmPasswordChange,
	};
}
