/* eslint-disable @typescript-eslint/ban-types */
import { useInterpret, useSelector } from "@xstate/react";
import React, { createContext, useContext } from "react";
import { useLogger } from "@thingco/logger";

import { contextSelectors, currentStateSelector } from "./selectors";
import { machine } from "../auth-system";

import type { ReactNode } from "react";
import type {
	DeviceSecurityType,
	LoginFlowType,
	AuthInterpreter,
	AuthState
} from "../types";

/**
 * The sole context value stored in the `AuthProvider` is the interpreted FSM.
 *
 * @category React
 * @internal
 */
const AuthProviderContext = createContext<{
	authenticator: AuthInterpreter;
} | null>(null);

/**
 * @category React
 */
export type AuthProviderProps = {
	/**
	 * The `AuthProvider` must have children: it's a context provider.
	 */
	children: ReactNode;
	/**
	 * The preconfigured device deviceSecurityType. This is configured on a
	 * per-client basis, so is fixed for each specific app.
	 */
	deviceSecurityType: DeviceSecurityType;
	/**
	 * The preconfigured device loginFlowType. This is configured on a per-client
	 * basis, so is fixed for each specific app.
	 */
	loginFlowType: LoginFlowType;
	/**
	 * If an OTP login flow is being used, defines how many retries are allowed
	 * before a user is bumped back to the start of the login process. Allows
	 * altering the machine default value.
	 */
	allowedOtpRetries?: number;
	/**
	 * If PIN device security is active, defines the length of the PIN. Allows
	 * altering the machine default value.
	 */
	pinLength?: number;
	/**
	 * Enables the `@xstate/inspect` visual diagram tool. This would be installed
	 * at point of use: in the entry point of an app. NOTE that this only works
	 * currently in a web context: attempting to use it with a React Native app
	 * will cause critical errors, as it requires the `window` object.
	 */
	useDevTools?: boolean;
	/**
	 * A function that will be given the state object after every event, and will
	 * dump that object somewhere. For example, the console -- `console.log` is a
	 * perfectly valid eventSink.
	 *
	 * This is useful for two reasons:
	 * 1. enables logging of everything that happens in the app, a la Redux logger
	 * 2. enables pushing records of events/state to somewhere controlled
	 * during tests
	 */
	eventSink?: (state: AuthState) => void;
};

/**
 * The React context provider that holds an interpreted version of the auth
 * system. Everything in the React part of the library relies on this.
 *
 * @category React
 */
export function AuthProvider({
	children,
	deviceSecurityType,
	loginFlowType,
	allowedOtpRetries = 3,
	pinLength = 4,
	useDevTools = false,
	eventSink = undefined,
}: AuthProviderProps) {
	const logger = useLogger();

	logger.log(`Creating auth system, ${loginFlowType}, ${deviceSecurityType}`);

	const authenticationSystem = machine.withContext({
		allowedOtpRetries,
		deviceSecurityType,
		loginFlowType,
		pinLength,
		loginCompleted: false,
	});

	const authenticator = useInterpret(
		authenticationSystem,
		{ devTools: useDevTools },
		(state) => {
			if (eventSink) {
				if (state.changed) {
					eventSink(state);
				}
			}
		},
	);

	return (
		<AuthProviderContext.Provider value={{ authenticator }}>
			{children}
		</AuthProviderContext.Provider>
	);
}

/**
 * This hook is not to be used externally, but is what powers the exposed
 * hooks for each state.
 *
 * @category React
 * @internal
 */
export function useAuthInterpreter() {
	const ctx = useContext(AuthProviderContext);
	if (!ctx)
		throw new Error(
			"`useAuthInterpreter` can only be used in a component tree beneath the `AuthProvider` component"
		);
	return ctx.authenticator;
}

/**
 * Gives access to specific context values that may be required in-app (whether
 * the auth is configured for OTP, or the current state value, for example).
 *
 * @remarks
 * This is not designed for use within any of the stage-specific hooks, it is
 * a utility for use in components in-app. For example profile screens, to
 * show/hide menu items depending upon whther the operations they trigger are
 * actually available.
 *
 * @category React
 */
export function useAuthProvider() {
	const authSystem = useAuthInterpreter();

	const allowedOtpRetries = useSelector(
		authSystem,
		contextSelectors.allowedOtpRetries
	);

	const currentState = useSelector(
		authSystem,
		currentStateSelector
	);

	const deviceSecurityType = useSelector(
		authSystem,
		contextSelectors.deviceSecurityType
	);

	const loginFlowType = useSelector(
		authSystem,
		contextSelectors.loginFlowType
	);

	const pinLength = useSelector(
		authSystem,
		contextSelectors.pinLength
	);

	return {
		allowedOtpRetries,
		currentState,
		deviceSecurityType,
		loginFlowType,
		pinLength,
	};
}
