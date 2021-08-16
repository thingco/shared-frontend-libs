/* eslint-disable @typescript-eslint/ban-types */
import { useInterpret } from "@xstate/react";
import React, { createContext, useContext, useEffect } from "react";

import { MSG__UNSCOPED_HOOK } from "./auth-system-utils";

import type { ReactNode } from "react";
import type {
	AuthenticationSystemInterpreter,
	AuthenticationSystemMachine,
	AuthenticationSystemState,
} from "./auth-system";

type Logger = {
	log: Function;
	info: Function;
	warn: Function;
	error: Function;
};

const AuthSystemProviderContext = createContext<{
	authenticator: AuthenticationSystemInterpreter;
	logger: Logger;
} | null>(null);

export type AuthenticationSystemProviderProps = {
	/**
	 * The finite state machine itself. This is passed in fully constructed: this allows for
	 * any modifications to be made outside of the provider (for example, for config or for testing).
	 */
	authenticationSystem: AuthenticationSystemMachine;
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
	eventSink?: (state: AuthenticationSystemState) => void;
	/**
	 * Logging. Needs to be an interface with the standard console functions of `log`, `info`, `warn` and `error`.
	 * It defaults to console, but using a logger that can be turned off and on for different environments
	 * is preferable.
	 */
	logger?: Logger;
};
export function AuthenticationSystemProvider({
	authenticationSystem,
	children,
	useDevTools = false,
	eventSink = undefined,
	logger = console,
}: AuthenticationSystemProviderProps) {
	const authenticator = useInterpret(authenticationSystem, { devTools: useDevTools }, (state) => {
		if (eventSink) {
			if (state.changed) {
				eventSink(state);
			}
		}
	});

	return (
		<AuthSystemProviderContext.Provider value={{ authenticator, logger }}>
			{children}
		</AuthSystemProviderContext.Provider>
	);
}

export function useAuthSystem() {
	const ctx = useContext(AuthSystemProviderContext);
	if (!ctx) throw new Error(MSG__UNSCOPED_HOOK("useAuthSystem"));
	return ctx.authenticator;
}

export function useAuthSystemLogger() {
	const ctx = useContext(AuthSystemProviderContext);
	if (!ctx) throw new Error(MSG__UNSCOPED_HOOK("useAuthSystem"));
	return ctx.logger;
}
