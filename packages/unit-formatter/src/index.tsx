import React from "react";

import {
	date as dateFormatter,
	dateTime as dateTimeFormatter,
	distance as distanceFormatter,
	duration as durationFormatter,
	speed as speedFormatter,
	time as timeFormatter,
	DistanceUnit,
} from "./formatters";

const LOCAL_STORAGE_KEY = "unitFormatPreferences";

/**
 * The unit formatter functions live in the `value` object of a context provider,
 * so the keys of that object are the function names.
 */
export type UnitFormatterFunctionName =
	| "compactDuration"
	| "date"
	| "dateTime"
	| "distance"
	| "expandedDuration"
	| "speed"
	| "time";

/**
 * The context provider containing the formatter function, allowing access to them from
 * anywhere in the app.
 */
const UnitFormatterFunctions = React.createContext<
	Record<UnitFormatterFunctionName, (arg: number) => string>
>({
	speed: () => "",
	distance: () => "",
	date: () => "",
	time: () => "",
	dateTime: () => "",
	compactDuration: () => "",
	expandedDuration: () => "",
});

/**
 * The preference state is a record of modifiable formatting preferences.
 */
export interface UnitFormatterPreferenceState {
	distanceUnit: DistanceUnit;
	precision: number;
	locale: undefined | string;
	hour12: boolean;
}

export type UnitFormatterPreferenceAction =
	| { type: "setPrecision"; payload: number }
	| { type: "setLocale"; payload: string }
	| { type: "setHour12"; payload: boolean }
	| { type: "setDistanceUnit"; payload: DistanceUnit }
	| { type: "completeUpdate" }
	| { type: "reset" };

const unitFormatterPreferenceDefaults: UnitFormatterPreferenceState = {
	distanceUnit: "km",
	precision: 0,
	locale: undefined,
	hour12: false,
};

/**
 * Lazy initialisation is used for the preferences reducer to allow it to pull
 * values from local storage if they're present.
 */
function unitFormatterPreferenceInit(): UnitFormatterPreferenceState {
	const storedPrefs = localStorage.getItem(LOCAL_STORAGE_KEY);

	if (storedPrefs) {
		return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) as string);
	} else {
		return unitFormatterPreferenceDefaults;
	}
}

/**
 * @param state
 * @param updateAction
 */
function unitFormatterPreference(
	state: UnitFormatterPreferenceState,
	updateAction: UnitFormatterPreferenceAction
): UnitFormatterPreferenceState {
	switch (updateAction.type) {
		case "setDistanceUnit":
			return { ...state, distanceUnit: updateAction.payload };
		case "setLocale":
			return { ...state, locale: updateAction.payload };
		case "setHour12":
			return { ...state, hour12: updateAction.payload };
		case "setPrecision":
			return { ...state, precision: updateAction.payload };
		case "completeUpdate":
			return { ...state };
		case "reset":
			return unitFormatterPreferenceInit();
		default:
			return state;
	}
}

const UnitFormatterPreferenceState = React.createContext<UnitFormatterPreferenceState>(
	unitFormatterPreferenceDefaults
);
const UnitFormatterPreferenceDispatch = React.createContext<{
	dispatch: React.Dispatch<UnitFormatterPreferenceAction>;
}>({ dispatch: () => ({ type: "reset" }) });

/**
 * The overall unit format provider, allowing access to both the formatter functions and the
 *
 * @param root0
 * @param root0.children
 */
export const UnitFormatterProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
	const [state, dispatch] = React.useReducer(
		unitFormatterPreference,
		unitFormatterPreferenceDefaults,
		unitFormatterPreferenceInit
	);

	/* ------------------------------------------------------------------------------------ *\
   * Wrapped formatters -- changes to preferences will cause them to rerun and
   * return updated formatter functions
  \* ------------------------------------------------------------------------------------ */
	const speed = React.useCallback(
		() =>
			speedFormatter({
				locale: state.locale,
				precision: state.precision,
				unitPreference: state.distanceUnit,
			}),
		[state.locale, state.precision, state.distanceUnit]
	);

	const distance = React.useCallback(
		() =>
			distanceFormatter({
				locale: state.locale,
				precision: state.precision,
				unitPreference: state.distanceUnit,
			}),
		[state.locale, state.precision, state.distanceUnit]
	);

	const date = React.useCallback(() => dateFormatter({ locale: state.locale }), [state.locale]);

	const time = React.useCallback(
		() => timeFormatter({ locale: state.locale, hour12: state.hour12 }),
		[state.locale, state.hour12]
	);

	const dateTime = React.useCallback(
		() => dateTimeFormatter({ locale: state.locale, hour12: state.hour12 }),
		[state.locale, state.hour12]
	);

	const compactDuration = React.useCallback(
		() => durationFormatter({ locale: state.locale, displayStyle: "compact" }),
		[state.locale]
	);

	const expandedDuration = React.useCallback(
		() => durationFormatter({ locale: state.locale, displayStyle: "expanded" }),
		[state.locale]
	);

	/**
	 * Because the preferences always need to be saved to a client's local storage, enhance the
	 * dispatch function that gets passed to the context provider with a fire-and-forget local storage setter.
	 *
	 * @param action
	 */
	const dispatchWithSideEffect = (action: UnitFormatterPreferenceAction) => {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(unitFormatterPreference(state, action)));
		return dispatch(action);
	};

	return (
		<UnitFormatterPreferenceState.Provider value={state}>
			<UnitFormatterPreferenceDispatch.Provider value={{ dispatch: dispatchWithSideEffect }}>
				<UnitFormatterFunctions.Provider
					value={{
						distance: distance(),
						speed: speed(),
						date: date(),
						time: time(),
						dateTime: dateTime(),
						expandedDuration: expandedDuration(),
						compactDuration: compactDuration(),
					}}
				>
					{children}
				</UnitFormatterFunctions.Provider>
			</UnitFormatterPreferenceDispatch.Provider>
		</UnitFormatterPreferenceState.Provider>
	);
};

/**
 *
 */
export function useUpdateFormatPreferences(): React.Dispatch<UnitFormatterPreferenceAction> {
	const { dispatch } = React.useContext(UnitFormatterPreferenceDispatch);
	if (!UnitFormatterPreferenceDispatch) {
		throw new Error();
	}
	return dispatch;
}

/**
 *
 */
export function useGetFormatPreferences(): UnitFormatterPreferenceState {
	const preferences = React.useContext(UnitFormatterPreferenceState);
	if (!UnitFormatterPreferenceState) {
		throw new Error();
	}
	return preferences;
}

/**
 *
 */
export function useFormat(): Record<UnitFormatterFunctionName, (arg: number) => string> {
	const formatters = React.useContext(UnitFormatterFunctions);
	if (!UnitFormatterFunctions) {
		throw new Error();
	}
	return formatters;
}

export * from "./formatters";
export * from "./converters";
