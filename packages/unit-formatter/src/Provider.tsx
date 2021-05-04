import { usePrefs } from "@thingco/user-preferences";
import React from "react";

import { date, dateTime, distance, duration, speed, time } from "./formatters";

type UnitFormatterFunctionName =
	| "compactDuration"
	| "date"
	| "dateTime"
	| "distance"
	| "expandedDuration"
	| "speed"
	| "time";

type UnitFormatterFunction = (arg: number | string) => string;

const UnitFormatterContext = React.createContext<Record<
	UnitFormatterFunctionName,
	UnitFormatterFunction
> | null>(null);

export const UnitFormatterProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
	const { prefs } = usePrefs();

	const formatters: Record<UnitFormatterFunctionName, (arg: number | string) => string> = {
		compactDuration: duration({ locale: prefs.localePref, displayStyle: "compact" }),
		date: date({ locale: prefs.localePref }),
		dateTime: dateTime({ locale: prefs.localePref, timeDisplay: prefs.timeDisplayPref }),
		distance: distance({
			locale: prefs.localePref,
			precision: prefs.distanceUnitPrecisionPref,
			unitPreference: prefs.distanceUnitPref,
		}),
		expandedDuration: duration({ locale: prefs.localePref, displayStyle: "expanded" }),
		speed: speed({
			locale: prefs.localePref,
			precision: prefs.distanceUnitPrecisionPref,
			unitPreference: prefs.distanceUnitPref,
		}),
		time: time({ locale: prefs.localePref, timeDisplay: prefs.timeDisplayPref }),
	};

	return (
		<UnitFormatterContext.Provider value={formatters}>{children}</UnitFormatterContext.Provider>
	);
};

export function useFormatter(): Record<UnitFormatterFunctionName, UnitFormatterFunction> {
	const formatterFuncs = React.useContext(UnitFormatterContext);

	if (!formatterFuncs) {
		throw new Error(
			`No formatter functions found. Are you trying to use the hook outside of the UnitFormatterProvider?`
		);
	}

	return formatterFuncs;
}
