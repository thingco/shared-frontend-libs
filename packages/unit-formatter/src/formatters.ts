import { config } from "./config";
import {
	kmphToMph,
	metersToKilometers,
	metersToMiles,
	secondsToDurationObj,
	secondsToHours,
} from "./converters";

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

export function distanceUntilScored({
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
		const untilComplete = config.distanceScored - Number(distanceInMeters);
		const clampedProgress = untilComplete < 0 ? 0 : untilComplete;
		switch (unitPreference) {
			case "km":
				return `${formatter.format(metersToKilometers(clampedProgress))} km`;
			case "mi":
				return `${formatter.format(metersToMiles(clampedProgress))} mi`;
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

export function averageSpeed({
	unitPreference = "km",
	precision = 0,
	locale = undefined,
}: SpeedOpts = {}): (
	distanceInMeters: number | string,
	durationInSeconds: number | string
) => string {
	const formatter = new Intl.NumberFormat(locale, {
		style: "decimal",
		useGrouping: true,
		minimumFractionDigits: precision,
		maximumFractionDigits: precision,
	});
	return function (distanceInMeters: number | string, durationInSeconds: number | string) {
		switch (unitPreference) {
			case "km":
				return `${formatter.format(
					Number(
						metersToKilometers(Number(distanceInMeters)) / secondsToHours(Number(durationInSeconds))
					)
				)} km/h`;
			case "mi":
				return `${formatter.format(
					Number(
						metersToMiles(Number(distanceInMeters)) / secondsToHours(Number(durationInSeconds))
					)
				)} mph`;
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
		return formatter.format(new Date(Number(timestamp)));
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
		second: "2-digit",
		hour12: timeDisplay === "12",
	});

	return function (timestamp: string | number) {
		return formatter.format(new Date(Number(timestamp)));
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
		second: "2-digit",
		hour12: timeDisplay === "12",
	});

	return function (timestamp: string | number) {
		return formatter.format(new Date(Number(timestamp)));
	};
}

export interface DurationOpts {
	locale?: LocalePreference | undefined;
	displayStyle?: "compact" | "expanded";
}

export function duration({ locale = undefined, displayStyle = "compact" }: DurationOpts = {}): (
	durationInSeconds: number | string
) => string {
	const timePartFormatter = new Intl.NumberFormat(locale, {
		style: "decimal",
		minimumIntegerDigits: displayStyle === "expanded" ? 1 : 2,
		maximumFractionDigits: 0,
	});

	return function (durationInSeconds: number | string): string {
		const { hours, minutes, seconds } = secondsToDurationObj(Number(durationInSeconds));
		const hrString = hours === 1 ? " hr" : " hrs";
		const minString = minutes === 1 ? " min" : " mins";
		const secString = seconds === 1 ? " sec" : " secs"
		
		switch (displayStyle) {
			case "compact":
				return `${timePartFormatter.format(hours)}:${timePartFormatter.format(minutes)}:${timePartFormatter.format(seconds)}`;
			case "expanded":
				const expandedTimes = []
				if (hours !== 0) {
					expandedTimes.push(timePartFormatter.format(hours) + hrString);
				}
				if (minutes !== 0) {
					expandedTimes.push(timePartFormatter.format(minutes) + minString);
				}
				if (seconds !== 0) {
					expandedTimes.push(timePartFormatter.format(seconds) + secString);
				}
				
				if (expandedTimes.length === 0) {
					console.warn("Duration is 0, this may be a data error");
					return "N/A"
				} else {
					return expandedTimes.join(", ");
				}
		}
	};
}
