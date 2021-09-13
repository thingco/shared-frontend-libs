/* eslint-disable @typescript-eslint/ban-types */
import { useInterpret, useSelector } from "@xstate/react";
import React, { createContext, useContext } from "react";

import type { ReactNode } from "react";
import { AuthInterpreter, AuthMachine, AuthState } from "./auth-system";
import { contextSelectors, currentStateSelector } from "./auth-system-selectors";

const AuthProviderContext = createContext<{
	authenticator: AuthInterpreter;
} | null>(null);

export type AuthProviderProps = {
	/**
	 * The finite state machine itself. This is passed in fully constructed: this allows for
	 * any modifications to be made outside of the provider (for example, for config or for testing).
	 */
	authenticationSystem: AuthMachine;
	children: ReactNode;
	/**
	 * Enables the `@xstate/inspect` visual diagram tool. This would be installed at point of use:
	 * in the entry point of an app. NOTE that this only works currently in a web context: attempting
	 * to use it with a React Native app will cause critical errors, as it requires the `window` object.
	 */
	useDevTools?: boolean;
	/**
	 * A function that will be given the state object after every event, and will dumps that object
	 * somewhere. For example, the console -- `console.log` is a perfectly valid eventSink.
	 *
	 * This is useful for two reasons:
	 * 1. enables logging of everything that happens in the app, a la Redux logger
	 * 2. enables pushing records of events/state to somewhere controlled during tests
	 */
	eventSink?: (state: AuthState) => void;
};

export function AuthProvider({
	authenticationSystem,
	children,
	useDevTools = false,
	eventSink = undefined,
}: AuthProviderProps) {
	const authenticator = useInterpret(authenticationSystem, { devTools: useDevTools }, (state) => {
		if (eventSink) {
			if (state.changed) {
				eventSink(state);
			}
		}
	});

	return (
		<AuthProviderContext.Provider value={{ authenticator }}>
			{children}
		</AuthProviderContext.Provider>
	);
}

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
 * This is not designed for use within any of the stage-specific hooks, it is
 * a utility for use in components in-app. For example profile screens, to show/hide
 * menu items depending upon whther the operations they trigger are actually
 * available.
 */
export function useAuthProvider() {
	const authSystem = useAuthInterpreter();
	const currentState = useSelector(authSystem, currentStateSelector);
	const loginFlowType = useSelector(authSystem, contextSelectors.loginFlowType);
	const deviceSecurityType = useSelector(authSystem, contextSelectors.deviceSecurityType);

	return {
		currentState,
		loginFlowType,
		deviceSecurityType,
	};
}
