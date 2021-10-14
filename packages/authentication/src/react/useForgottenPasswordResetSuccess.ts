/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useLogger } from "@thingco/logger";
import { useSelector } from "@xstate/react";

import { useAuthInterpreter } from "./AuthSystemProvider";
import { stateSelectors } from "./selectors";

/**
 * Once a user has successfully reset their password, they have to log back in. To
 * make this simpler from a logic point of view, this state exists to allow easy
 * transition back to the username/password input (and to allow for a useful message
 * informing them they've succesfully changed their password & need to log back in).
 *
 * @category React
 */
export function useForgottenPasswordResetSuccess() {
	const authenticator = useAuthInterpreter();
	const isActive = useSelector(authenticator, stateSelectors.isForgottenPasswordResetSuccess!);
	const logger = useLogger();

	const confirmPasswordReset = () => {
		logger.info(
			"Confirmation of successful password reset sent to system to allow transition back to unsername/password input"
		);
		authenticator.send({ type: "CONFIRM_PASSWORD_RESET" });
	};

	return {
		isActive,
		confirmPasswordReset,
	};
}
