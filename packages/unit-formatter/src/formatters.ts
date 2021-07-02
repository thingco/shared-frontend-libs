import { kmphToMph, metersToKilometers, metersToMiles, secondsToDurationObj } from "./converters";

import type {
	DistancePrecisionPreference,
	DistanceUnitPreference,
	LocalePreference,
	TimeDisplayPreference,
} from "@thingco/shared-types";

export interface DistanceOpts {
	unitPreference?: DistanceUnitPreference;
	precision?: DistancePrecisionPreference;
	locale?: LocalePreference | undefined;
}

export function distance({
	unitPreference = "km",
	precision = 0,
	locale = undefined,
}: DistanceOpts = {}): (distanceInMeters: number | string) => string {
	const formatter = Intl.NumberFormat(locale, {
		style: "decimal",
		useGrouping: true,
		minimumFractionDigits: precision,
		maximumFractionDigits: precision,
	});

	return function (distanceInMeters: number | string) {
		switch (unitPreference) {
			case "km":
				return `${formatter.format(metersToKilometers(Number(distanceInMeters)))} km`;
			case "mi":
				return `${formatter.format(metersToMiles(Number(distanceInMeters)))} mi`;
		}
	};
}

export interface SpeedOpts {
	unitPreference?: DistanceUnitPreference;
	precision?: DistancePrecisionPreference;
	locale?: LocalePreference | undefined;
}

export function speed({
	unitPreference = "km",
	precision = 0,
	locale = undefined,
}: SpeedOpts = {}): (speedInKmph: number | string) => string {
	const formatter = new Intl.NumberFormat(locale, {
		style: "decimal",
		useGrouping: true,
		minimumFractionDigits: precision,
		maximumFractionDigits: precision,
	});
	return function (speedInKmph: number | string) {
		switch (unitPreference) {
			case "km":
				return `${formatter.format(Number(speedInKmph))} km/h`;
			case "mi":
				return `${formatter.format(kmphToMph(Number(speedInKmph)))} mph`;
		}
	};
}

export interface DateOpts {
	locale?: LocalePreference;
}

export function date({ locale = undefined }: DateOpts = {}): (
	timestamp: string | number
) => string {
	const formatter = new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "numeric",
		day: "numeric",
	});

	return function (timestamp: string | number) {
		return formatter.format(new Date(timestamp));
	};
}

export interface TimeOpts {
	locale?: LocalePreference | undefined;
	timeDisplay?: TimeDisplayPreference;
}

export function time({ locale = undefined, timeDisplay = "24" }: TimeOpts = {}): (
	timestamp: string | number
) => string {
	const formatter = new Intl.DateTimeFormat(locale, {
		hour: timeDisplay === "12" ? "numeric" : "2-digit",
		minute: "2-digit",
		hour12: timeDisplay === "12",
	});

	return function (timestamp: string | number) {
		return formatter.format(new Date(timestamp));
	};
}

export interface DateTimeOpts {
	locale?: LocalePreference | undefined;
	timeDisplay?: TimeDisplayPreference;
}

export function dateTime({ locale = undefined, timeDisplay = "24" }: DateTimeOpts = {}): (
	timestamp: string | number
) => string {
	const formatter = new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: timeDisplay === "12" ? "numeric" : "2-digit",
		minute: "2-digit",
		hour12: timeDisplay === "12",
	});

	return function (timestamp: string | number) {
		return formatter.format(new Date(timestamp));
	};
}

export interface DurationOpts {
	locale?: LocalePreference | undefined;
	displayStyle?: "compact" | "expanded";
}

export function duration({ locale = undefined, displayStyle = "compact" }: DurationOpts = {}): (
	durationInSeconds: number | string
) => string {
	const hourFormatter = new Intl.NumberFormat(locale, {
		style: "decimal",
		minimumIntegerDigits: displayStyle === "expanded" ? 1 : 2,
		maximumFractionDigits: 0,
	});

	const minuteFormatter = new Intl.NumberFormat(locale, {
		style: "decimal",
		minimumIntegerDigits: displayStyle === "expanded" ? 1 : 2,
		maximumFractionDigits: 0,
	});

	return function (durationInSeconds: number | string): string {
		const { hours, minutes } = secondsToDurationObj(Number(durationInSeconds));
		const hoursString = hourFormatter.format(hours);
		const minutesString = minuteFormatter.format(minutes);
		const hrString = Number(hoursString) === 1 ? "hr" : "hrs";
		switch (displayStyle) {
			case "compact":
				return `${hoursString}:${minutesString}`;
			case "expanded":
				if (!hours && minutes) {
					return `${minutesString} mins`;
				} else if (hours && !minutes) {
					return `${hoursString} ${hrString}`;
				} else {
					return `${hoursString} ${hrString}, ${minutesString} mins`;
				}
		}
	};
}
