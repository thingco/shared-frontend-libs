import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
	UserPreferencesStorage,
	UserPreferencesStorageKey,
	UserPreferences,
} from "@thingco/application-configuration";

const KEY: UserPreferencesStorageKey = "@user_preferences";

const NO_STORED_DATA_WARNING = `
No preferences found in storage!
This indicates that the device storage has not yet been populated.
The preferences are being reset back to defaults.
`;

export function createPrefStore(defaultPreferences: UserPreferences): UserPreferencesStorage {
	return {
		async getPreferences() {
			const storedPrefs = await AsyncStorage.getItem(KEY);
			if (!storedPrefs) {
				console.warn(NO_STORED_DATA_WARNING);
				await AsyncStorage.setItem(KEY, JSON.stringify(defaultPreferences));
				return await defaultPreferences;
			} else {
				return await JSON.parse(storedPrefs);
			}
		},
		async getPreference(key) {
			const storedPrefs = await AsyncStorage.getItem(KEY);
			if (!storedPrefs) {
				console.warn(NO_STORED_DATA_WARNING);
				await AsyncStorage.setItem(KEY, JSON.stringify(defaultPreferences));
				return await defaultPreferences[key];
			} else {
				const prefs = JSON.parse(storedPrefs);
				return await prefs[key];
			}
		},
		async setPreference(key, value) {
			const storedPrefs = await AsyncStorage.getItem(KEY);
			if (!storedPrefs) {
				console.warn(NO_STORED_DATA_WARNING);
				defaultPreferences[key] = value;
				await AsyncStorage.setItem(KEY, JSON.stringify(defaultPreferences));
			} else {
				const prefs = JSON.parse(storedPrefs);
				prefs[key] = value;
				await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
			}
			return await void 0;
		},
	};
}
