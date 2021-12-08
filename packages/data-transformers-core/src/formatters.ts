import { blockDistanceRemaining } from "./calculators";
import {
	kmphToMph,
	metersToKilometers,
	metersToMiles,
	mpsToKmph,
	mpsToMph,
	secondsToDurationObj,
} from "./converters";
import { formatDecimal } from "./number-utils";
import { normaliseTimestamp } from "./date-utils";

import type {
	DistancePrecisionPreference,
	DistanceUnitPreference,
	LocalePreference,
	TimeDisplayPreference,
} from "@thingco/shared-types";
import { format as formatDate } from "date-fns";

export interface DistanceOpts {
	distanceUntilScored?: number;
	unitPreference?: DistanceUnitPreference;
	precision?: DistancePrecisionPreference;
	locale?: LocalePreference | undefined;
}

/**
 * Factory for the distance formatter.
 */
export function distance({
	unitPreference = "km",
	precision = 0,
	locale = undefined,
}: DistanceOpts = {}): (distanceInMetres: number | string) => string {
	return function (distanceInMetres: number | string) {
		distanceInMetres = Number(distanceInMetres);

		switch (unitPreference) {
			case "km":
				return `${formatDecimal(metersToKilometers(distanceInMetres), precision, locale)} km`;
			case "mi":
				return `${formatDecimal(metersToMiles(distanceInMetres), precision, locale)} km`;
		}
	};
}

/**
 * Factory for the distanceUntilScored formatter.
 */
export function distanceUntilScored({
	unitPreference = "km",
	distanceUntilScored = 160934,
	precision = 0,
	locale = undefined,
}: DistanceOpts = {}): (distanceCompletedInMetres: number | string) => string {
	return function (distanceCompletedInMetres: number | string) {
		const progress = blockDistanceRemaining(distanceUntilScored, Number(distanceCompletedInMetres));

		switch (unitPreference) {
			case "km":
				return `${formatDecimal(metersToKilometers(progress), precision, locale)} km`;
			case "mi":
				return `${formatDecimal(metersToMiles(progress), precision, locale)} mi`;
		}
	};
}

export interface SpeedOpts {
	unitPreference?: DistanceUnitPreference;
	precision?: DistancePrecisionPreference;
	locale?: LocalePreference | undefined;
}

/**
 * Factory for the speed formatter.
 */
export function speed({
	unitPreference = "km",
	precision = 0,
	locale = undefined,
}: SpeedOpts = {}): (speedInKmph: number | string) => string {
	return function (speedInKmph: number | string) {
		speedInKmph = Number(speedInKmph);

		switch (unitPreference) {
			case "km":
				return `${formatDecimal(speedInKmph, precision, locale)} km/h`;
			case "mi":
				return `${formatDecimal(kmphToMph(speedInKmph), precision, locale)} mph`;
		}
	};
}

/**
 * Factory for the averageSpeed formatter.
 */
export function averageSpeed({
	unitPreference = "km",
	precision = 0,
	locale = undefined,
}: SpeedOpts = {}): (
	distanceInMetres: number | string,
	durationInSeconds: number | string
) => string {
	return function (distanceInMetres: number | string, durationInSeconds: number | string) {
		const metresPerSecond = Number(distanceInMetres) / Number(durationInSeconds);

		switch (unitPreference) {
			case "km":
				return `${formatDecimal(mpsToKmph(metresPerSecond), precision, locale)} km/h`;
			case "mi":
				return `${formatDecimal(mpsToMph(metresPerSecond), precision, locale)} mph`;
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
	return function (timestamp: string | number) {
		const date = new Date(normaliseTimestamp(timestamp));
		switch (timeDisplay) {
			case "12":
				return formatDate(date, "p");
			case "24":
				return formatDate(date, "k:mm");
		}
	};
}

export interface DateTimeOpts {
	locale?: LocalePreference | undefined;
	timeDisplay?: TimeDisplayPreference;
}

export function dateTime({ locale = undefined, timeDisplay = "24" }: DateTimeOpts = {}): (
	timestamp: string | number
) => string {
	return function (timestamp: string | number) {
		const date = new Date(normaliseTimestamp(timestamp));
		switch (timeDisplay) {
			case "12":
				return formatDate(date, "P p");
			case "24":
				return formatDate(date, "P k:mm");
		}
	};
}

export interface DurationOpts {
	locale?: LocalePreference | undefined;
	displayStyle?: "compact" | "expanded";
}

export function duration({ locale = undefined, displayStyle = "compact" }: DurationOpts = {}): (
	durationInSeconds: number | string
) => string {
	return function (durationInSeconds: number | string): string {
		const { hours, minutes } = secondsToDurationObj(Number(durationInSeconds));
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
