import { useSelector } from "@xstate/react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

import { AuthenticationSystemState, AuthStateId } from "./auth-system";
import { useAuthSystem, useAuthSystemLogger } from "./AuthSystemProvider";

type AuthStageCallback = () => void;

type SessionCheckCb = () => Promise<unknown>;

function isAwaitingSessionCheck(state: AuthenticationSystemState) {
	return state.matches(AuthStateId.awaitingSessionCheck);
}
export function useAwaitingSessionCheck(cb: SessionCheckCb) {
	const authenticator = useAuthSystem();
	const isActive = useSelector(authenticator, isAwaitingSessionCheck);
	const logger = useAuthSystemLogger();

	const [isLoading, setIsLoading] = useState(false);

	const checkSession = useCallback(async () => {
		setIsLoading(true);
		logger.log("checking for an active session. Failure of request === no session");

		try {
			const res = await cb();
			logger.log(res);
			authenticator.send({ type: "SESSION_PRESENT" });
		} catch (err) {
			logger.log(err);
			authenticator.send({ type: "SESSION_NOT_PRESENT" });
		} finally {
			logger.log("session check made, switching to next state");
			setIsLoading(false);
		}
	}, [cb]);

	return {
		isActive,
		isLoading,
		checkSession,
	};
}

function isAwaitingUsername(state: AuthenticationSystemState) {
	return state.matches(AuthStateId.awaitingUsername);
}

export function useAwaitingUsername<User = any>(cb: (username: string) => Promise<User>) {
	const authenticator = useAuthSystem();
	const isActive = useSelector(authenticator, isAwaitingUsername);
	const logger = useAuthSystemLogger();

	const [isLoading, setIsLoading] = useState(false);

	const validateUsername = useCallback(
		async (usernameToValidate: string) => {
			setIsLoading(true);
			// prettier-ignore
			logger.log("validating submitted username. Success will return a user object, failure means no username found.");

			try {
				const user = await cb(usernameToValidate);
				logger.log(user);
				authenticator.send({ type: "USERNAME_VALID", username: usernameToValidate, user });
			} catch (err) {
				logger.log(err);
				authenticator.send({ type: "USERNAME_INVALID" });
			} finally {
				setIsLoading(false);
			}
		},
		[cb]
	);

	return {
		isActive,
		isLoading,
		validateUsername,
	};
}

export function useAwaitingOtp(cb: AuthStageCallback) {
	/* dummy */
}

export function useAwaitingCurrentPassword(cb: AuthStageCallback) {
	/* dummy */
}

export function useAwaitingForcedChangePassword(cb: AuthStageCallback) {
	/* dummy */
}

export function useAwaitingNewPassword(cb: AuthStageCallback) {
	/* dummy */
}

export function useAwaitingForgottenPassword(cb: AuthStageCallback) {
	/* dummy */
}

export function usePinChecks(cb: AuthStageCallback) {
	/* dummy */
}

export function useAwaitingCurrentPinInput(cb: AuthStageCallback) {
	/* dummy */
}

export function useAwaitingNewPinInput(cb: AuthStageCallback) {
	/* dummy */
}

export function useAwaitingChangePinInput(cb: AuthStageCallback) {
	/* dummy */
}

export function useLoggingOut(cb: AuthStageCallback) {
	/* dummy */
}

export function useAuthenticated(cb: AuthStageCallback) {
	/* dummy */
}
