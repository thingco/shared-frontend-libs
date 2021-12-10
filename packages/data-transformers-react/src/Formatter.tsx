import React, { useCallback } from "react";
import {
	formatters,
	Locale,
	ClockFormat,
	DateDisplayFormat,
	DistanceUnit,
} from "@thingco/data-transformers-core";

type FormatterFunctions = {
	[K in keyof typeof formatters]: ReturnType<typeof formatters[K]>;
};

type FormatterHookOverrrides = {
	locale?: Locale;
	clockFormat?: ClockFormat;
	dateDisplayFormat?: DateDisplayFormat;
	distanceUnit?: DistanceUnit;
	distanceUntilScored?: number;
	precision?: number;
	showSeconds?: boolean;
};

export function useFormatter({
	locale = "en-GB",
	clockFormat = "24",
	distanceUnit = "km",
	distanceUntilScored = 160934,
	dateDisplayFormat = "compact",
	precision = 0,
	showSeconds = false,
}: FormatterHookOverrrides = {}): FormatterFunctions {
	return {
		averageSpeed: useCallback(formatters.averageSpeed({ locale, precision, distanceUnit }), [
			locale,
			distanceUnit,
			precision,
		]),
		date: useCallback(formatters.date({ locale }), [locale]),
		dateTime: useCallback(formatters.dateTime({ locale, clockFormat }), [locale, clockFormat]),
		distance: useCallback(formatters.distance({ locale, precision, distanceUnit }), [
			locale,
			precision,
			distanceUnit,
		]),
		distanceUntilScored: useCallback(
			formatters.distanceUntilScored({ locale, precision, distanceUnit, distanceUntilScored }),
			[locale, distanceUnit, precision]
		),
		duration: useCallback(formatters.duration({ locale, dateDisplayFormat, showSeconds }), [
			locale,
			dateDisplayFormat,
			showSeconds,
		]),
		speed: useCallback(formatters.speed({ locale, precision, distanceUnit }), [
			locale,
			precision,
			distanceUnit,
		]),
		time: useCallback(formatters.time({ locale, clockFormat, showSeconds }), [
			locale,
			clockFormat,
			showSeconds,
		]),
	};
}
