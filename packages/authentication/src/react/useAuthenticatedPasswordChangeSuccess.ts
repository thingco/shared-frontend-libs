/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";

import { useAuthInterpreter } from "./AuthSystemProvider";
import { stateSelectors } from "./selectors";

/**
 * Once a user has successfully changed their password, this intermediate state
 * allows for a modal/screen telling the user everything has updated as expected,
 * and letting them get back to where they were in the app.
 */
export function useAuthenticatedPasswordChangeSuccess() {
	const authenticator = useAuthInterpreter();
	const isActive = useSelector(authenticator, stateSelectors.isAuthenticatedPasswordChangeSuccess!);
	const logger = useLogger();

	const confirmPasswordChange = () => {
		// prettier-ignore
		logger.info("Confirmation of successful password change sent to system");
		authenticator.send({ type: "CONFIRM_PASSWORD_RESET" });
	};

	return {
		isActive,
		confirmPasswordChange,
	};
}
