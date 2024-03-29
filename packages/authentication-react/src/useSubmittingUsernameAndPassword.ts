/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelector } from "@xstate/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthInterpreter } from "./AuthSystemProvider";
import type { ValidateUsernameAndPasswordCb } from "./callback-types";
import type { InputValidationPattern } from "./input-validation";
import { validateInputs } from "./input-validation";
import { contextSelectors, stateSelectors } from "./selectors";

/**
 * The core USERNAME_PASSWORD login flow hook.
 *
 * @remarks
 * NOTE: there are peculiarities regarding what the callback must return.
 * The remote authentication system (i.e. Cognito) may resolve but indicate
 * that a user must reset their password. IT IS EXTREMELY IMPORTANT THAT THIS
 * IS HANDLED IN THE CALLBACK. If that isn.t handled, a user who has had
 * a temporary password set will not be able to log in.
 *
 * @category React
 */
export function useSubmittingUsernameAndPassword<User = any>(
	cb: ValidateUsernameAndPasswordCb<User>,
	validators: {
		username: InputValidationPattern[];
		password: InputValidationPattern[];
	} = { username: [], password: [] }
) {
	const isMounted = useRef(true);
	const authenticator = useAuthInterpreter();
	const error = useSelector(authenticator, contextSelectors.error);
	const isActive = useSelector(authenticator, stateSelectors.isSubmittingUsernameAndPassword!);

	const [validationErrors, setValidationErrors] = useState<{
		username: string[];
		password: string[];
	}>({ username: [], password: [] });
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => () => {
		isMounted.current = false;
	}, []);

	const validateUsernameAndPassword = useCallback(
		async (username, password) => {
			const validationErrors = validateInputs(validators, { username, password });
			if (validationErrors.username.length > 0 || validationErrors.password.length > 0) {
				setValidationErrors(
					validationErrors as { [inputKey in keyof typeof validators]: string[] }
				);
				return;
			} else {
				setIsLoading(true);
				try {
					const resp = await cb(username, password);
					if (Array.isArray(resp) && resp[0] === "NEW_PASSWORD_REQUIRED") {
						authenticator.send({ type: "USERNAME_AND_PASSWORD_VALID_PASSWORD_CHANGE_REQUIRED", user: resp[1], username, error: "PASSWORD_CHANGE_REQUIRED" });
					} else {
						authenticator.send({ type: "USERNAME_AND_PASSWORD_VALID", user: resp, username });
					}
				} catch (err) {
					// REVIEW check errors here to see if can tell if username or password are individually invalid:
					authenticator.send({
						type: "USERNAME_AND_PASSWORD_INVALID",
						error: "USERNAME_AND_PASSWORD_INVALID",
					});
				} finally {
					if (isMounted.current) setIsLoading(false);
				}
			}
		},
		[authenticator, isLoading, isActive, error, validationErrors]
	);

	const forgottenPassword = () => {
		authenticator.send({ type: "FORGOTTEN_PASSWORD" });
	};

	return {
		error,
		isActive,
		isLoading,
		validateUsernameAndPassword,
		validationErrors,
		forgottenPassword,
	};
}
