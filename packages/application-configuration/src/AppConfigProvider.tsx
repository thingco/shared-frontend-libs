import React from "react";

import {
	UserPreferencesProvider,
	UserPreferencesReadContext,
	UserPreferencesWriteContext,
} from "./UserPreferencesProvider";

import type { ApplicationConfiguration, UserPreferencesStorage, UserPreferences } from "./types";
/**
 * Application configuration can be read, that's it. Config is passed into the
 * provider as a prop and is available via a hook. This is just to centralise things.
 *
 * NOTE going forward, what this also means is that config could possibly be fetched from a remote
 * source? This causes an issue about order though -- need to authorise to do that, but if
 * preference for OTP/uname+pword is stored in config, then config has to go above auth.
 */
const ApplicationConfigContext = React.createContext<ApplicationConfiguration | null>(null);

export type ApplicationConfigProviderProps = {
	configs: ApplicationConfiguration;
	children: React.ReactNode;
	store: UserPreferencesStorage;
};

export const ApplicationConfigProvider = ({
	configs,
	children,
	store,
}: ApplicationConfigProviderProps) => {
	return (
		<ApplicationConfigContext.Provider value={{ ...configs }}>
			<UserPreferencesProvider store={store}>{children}</UserPreferencesProvider>
		</ApplicationConfigContext.Provider>
	);
};

export function usePreferences(): {
	prefs: UserPreferences;
	setPref: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
} {
	const prefs = React.useContext(UserPreferencesReadContext);
	const updater = React.useContext(UserPreferencesWriteContext);

	if (!prefs || !updater) {
		throw new Error(
			"The UserPreferencesProvider is not initialised in the component tree. Either this function is being called from outside the component tree that contains the UserPreferencesProvider, or the state of that provider has not initiialised correctly."
		);
	}

	return {
		prefs,
		setPref: updater.updateUserPreference,
	};
}

export function useConfig(): ApplicationConfiguration {
	const configs = React.useContext(ApplicationConfigContext);

	if (!configs) {
		throw new Error(
			"The ApplicationConfigProvider is not initialised in the component tree. Either this function is being called from outside the component tree that contains the ApplicationConfigProvider, or the state of that provider has not been initialised correctly."
		);
	}

	return configs;
}
