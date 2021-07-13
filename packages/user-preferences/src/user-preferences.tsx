import React from "react";

import type { Storage, UserPreferences } from "@thingco/shared-types";

const UserPrefsRead = React.createContext<UserPreferences | null>(null);
const UserPrefsWrite = React.createContext<{
	updateUserPreference: <K extends keyof UserPreferences>(
		key: K,
		value: UserPreferences[K]
	) => void;
} | null>(null);

type prefUpdate<K extends keyof UserPreferences> = {
	type: "UserPreferenceUpdate";
	key: K;
	value: UserPreferences[K];
};

function userPrefsReducer<K extends keyof UserPreferences>(
	state: UserPreferences,
	update: prefUpdate<K>
): UserPreferences {
	return { ...state, [update.key]: update.value };
}

const UserPrefsInitialisedProvider = ({
	children,
	store,
	initialPrefs,
}: UserPrefsProviderProps & { initialPrefs: UserPreferences }) => {
	const [persistState, setPersistState] = React.useState<prefUpdate<keyof UserPreferences> | null>(
		null
	);
	const [localPreferences, updateLocalPreferences] = React.useReducer(
		userPrefsReducer,
		initialPrefs
	);

	const updateUserPreference = <K extends keyof UserPreferences>(
		key: K,
		value: UserPreferences[K]
	) => {
		const updateObject: prefUpdate<K> = { type: "UserPreferenceUpdate", key, value };
		setPersistState(updateObject);
		updateLocalPreferences(updateObject);
	};

	React.useEffect(() => {
		const persist = async () => {
			if (persistState) {
				await store.setPreference(persistState.key, persistState.value);
				setPersistState(null);
			}
		};

		if (persistState !== null) persist();
	}, [persistState]);

	return (
		<UserPrefsRead.Provider value={localPreferences}>
			<UserPrefsWrite.Provider value={{ updateUserPreference }}>{children}</UserPrefsWrite.Provider>
		</UserPrefsRead.Provider>
	);
};

export interface UserPrefsProviderProps {
	children: React.ReactNode;
	store: Storage;
}

export const UserPrefsProvider = ({ children, store }: UserPrefsProviderProps): JSX.Element => {
	const [initialPrefs, setInitialPrefs] = React.useState<UserPreferences | null>(null);
	React.useEffect(() => {
		const init = async () => {
			const prefs = await store.getPreferences();
			setInitialPrefs(prefs);
		};
		init();
	}, []);

	return initialPrefs ? (
		<UserPrefsInitialisedProvider store={store} initialPrefs={initialPrefs}>
			{children}
		</UserPrefsInitialisedProvider>
	) : (
		<></>
	);
};

export function usePrefs(): {
	prefs: UserPreferences;
	setPref: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
} {
	const prefs = React.useContext(UserPrefsRead);
	const updater = React.useContext(UserPrefsWrite);

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
