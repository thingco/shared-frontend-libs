import React from "react";

import type { UserPreferencesStorage, UserPreferences } from "./types";

/**
 * User preferences can be read and written to: they exist only within the
 * context of the application.
 */
export const UserPreferencesReadContext = React.createContext<UserPreferences | null>(null);
export const UserPreferencesWriteContext = React.createContext<{
	updateUserPreference: <K extends keyof UserPreferences>(
		key: K,
		value: UserPreferences[K]
	) => void;
} | null>(null);

/**
 * A reducer is used to update the preferences. Each update is for a single
 * property, so the action accepts these, with the key used as the discriminant.
 */
export type preferenceUpdate<K extends keyof UserPreferences> = {
	type: "UserPreferenceUpdate";
	key: K;
	value: UserPreferences[K];
};

function userPreferencesReducer<K extends keyof UserPreferences>(
	state: UserPreferences,
	update: preferenceUpdate<K>
): UserPreferences {
	return { ...state, [update.key]: update.value };
}

/**
 * The actual provider, built once persisted preferences have been pulled from
 * local device storage.
 */
export const UserPreferencesInitialisedProvider = ({
	children,
	store,
	initialPreferences,
}: UserPreferencesProviderProps & { initialPreferences: UserPreferences }) => {
	/**
	 * `localPreferences` is the user preferences object stored in memory.
	 */
	const [localPreferences, updateLocalPreferences] = React.useReducer(
		userPreferencesReducer,
		initialPreferences
	);
	/**
	 * `persistState` represents a command to store an update to the persisted user preferences.
	 */
	const [persistAction, setPersistAction] = React.useState<preferenceUpdate<
		keyof UserPreferences
	> | null>(null);

	/**
	 * The current preferences from persisted storage are passed into a reducer as the
	 * `initialPrefs` prop. When an update occurs, the update action is passed to the
	 * reducer to trigger a local update, and `persistAction` is set, which will trigger
	 * a save to device storage.
	 */
	const updateUserPreference = <K extends keyof UserPreferences>(
		key: K,
		value: UserPreferences[K]
	) => {
		const updateObject: preferenceUpdate<K> = { type: "UserPreferenceUpdate", key, value };
		setPersistAction(updateObject);
		updateLocalPreferences(updateObject);
	};

	/**
	 * When `persistAction` is set, update the storage then unset `persistAction`.
	 */
	React.useEffect(() => {
		const persist = async () => {
			if (persistAction) {
				await store.setPreference(persistAction.key, persistAction.value);
				setPersistAction(null);
			}
		};

		if (persistAction !== null) persist();
	}, [persistAction]);

	/** render */
	return (
		<UserPreferencesReadContext.Provider value={localPreferences}>
			<UserPreferencesWriteContext.Provider value={{ updateUserPreference }}>
				{children}
			</UserPreferencesWriteContext.Provider>
		</UserPreferencesReadContext.Provider>
	);
};

export interface UserPreferencesProviderProps {
	children: React.ReactNode;
	store: UserPreferencesStorage;
}

/**
 * The exposed provider, which does not render the actual provider until preferences are pulled
 * asynchronously from device storage.
 */
export const UserPreferencesProvider = ({
	children,
	store,
}: UserPreferencesProviderProps): JSX.Element => {
	const [initialPreferences, setInitialPreferences] = React.useState<UserPreferences | null>(null);
	React.useEffect(() => {
		const init = async () => {
			const prefs = await store.getPreferences();
			setInitialPreferences(prefs);
		};
		init();
	}, []);

	return initialPreferences ? (
		<UserPreferencesInitialisedProvider store={store} initialPreferences={initialPreferences}>
			{children}
		</UserPreferencesInitialisedProvider>
	) : (
		<></>
	);
};
