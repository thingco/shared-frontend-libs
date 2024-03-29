/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from "@xstate/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthInterpreter } from "./AuthSystemProvider";
import type { ValidateForceChangePasswordCb } from "./callback-types";
import type { InputValidationPattern } from "./input-validation";
import { validateInputs } from "./input-validation";
import { contextSelectors, stateSelectors } from "./selectors";

/**
 * When using USERNAME_PASSWORD flow, if a user has a temporary password (i.e.
 * they just had their account set up, or their password has been reset by an
 * admin), they will need to reset that password as it will have been sent to
 * them via plaintext.
 *
 * @category React
 */
export function useSubmittingForceChangePassword<User = any>(
	cb: ValidateForceChangePasswordCb<User>,
	validators: { password: InputValidationPattern[] } = { password: [] }
) {
	const isMounted = useRef(true);
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isSubmittingForceChangePassword!);
	const currentUserData = useSelector(authenticator, contextSelectors.user);
	const [validationErrors, setValidationErrors] = useState<{ password: string[] }>({
		password: [],
	});
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => () => {
		isMounted.current = false;
	}, []);

	const validateNewPassword = useCallback(
		async (password) => {
			const validationErrors = validateInputs(validators, { password });
			if (validationErrors.password.length > 0) {
				setValidationErrors(
					validationErrors as { [inputKey in keyof typeof validators]: string[] }
				);
				return;
			} else {
				setIsLoading(true);

				try {
					const user = await cb(currentUserData, password);
					authenticator.send({ type: "PASSWORD_FORCE_CHANGE_SUCCESS", user });
				} catch (err) {
					authenticator.send({ type: "PASSWORD_FORCE_CHANGE_FAILURE", error: "PASSWORD_CHANGE_FAILURE" });
				} finally {
					if (isMounted.current) setIsLoading(false);
				}
			}
		},
		[authenticator, error, isActive, isLoading, currentUserData, validationErrors]
	);

	return {
		error,
		isActive,
		isLoading,
		validateNewPassword,
		validationErrors,
	};
}
