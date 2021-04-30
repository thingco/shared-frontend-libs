export type DistanceUnitPreference = "mi" | "km";

export type TimeDisplayPreference = "12" | "24";

export interface UserPreferences {
	/**
	 * Imperial or Si, so miles or kilometres (`"mi"` or `"km"`)
	 */
	distanceUnitPref: DistanceUnitPreference;
	/**
	 * Whether to show time in 12 or 24 hour format.
	 */
	timeDisplayPref: TimeDisplayPreference;
}

export interface Storage {
	getPreference<P extends keyof UserPreferences>(key: P): Promise<UserPreferences[P]>;
	setPreference<P extends keyof UserPreferences>(key: P, value: UserPreferences[P]): Promise<void>;
}
