import { useConfig, usePreferences } from "@thingco/application-configuration";
import { useCallback } from "react";

import * as formatters from "./core/formatters";

export function useFormatter() {
	const {
		prefs: { locale, timeDisplay, distanceUnitPrecision, distanceUnit },
	} = usePreferences();
	const { distanceUntilScored } = useConfig();

	// prettier-ignore
	return {
		averageSpeed: useCallback(formatters.averageSpeed({ locale, precision: distanceUnitPrecision, unitPreference: distanceUnit }), [locale, distanceUnit, distanceUnitPrecision]),
		compactDuration: useCallback(formatters.duration({ locale, displayStyle: "compact" }), [locale]),
		date: useCallback(formatters.date({ locale }), [locale]),
		dateTime: useCallback(formatters.dateTime({ locale, timeDisplay }), [locale, timeDisplay]),
		distance: useCallback(formatters.distance({ locale, precision: distanceUnitPrecision, unitPreference: distanceUnit }), [locale, distanceUnitPrecision, distanceUnit]),
		distanceUntilScored: useCallback(formatters.distanceUntilScored({ locale, precision: distanceUnitPrecision, unitPreference: distanceUnit, distanceUntilScored }), [locale, distanceUnit, distanceUnitPrecision]),
		expandedDuration: useCallback(formatters.duration({ locale, displayStyle: "expanded" }), [locale]),
		speed: useCallback(formatters.speed({ locale, precision: distanceUnitPrecision, unitPreference: distanceUnit }), [locale, distanceUnitPrecision, distanceUnit]),
		time: useCallback(formatters.time({ locale, timeDisplay }), [locale, timeDisplay]),
	};
}
