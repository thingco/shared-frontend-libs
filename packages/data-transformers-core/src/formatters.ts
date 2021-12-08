import type {
    DistancePrecisionPreference,
    DistanceUnitPreference,
    LocalePreference,
    TimeDisplayPreference
} from "@thingco/shared-types";
import { blockDistanceRemaining } from "./calculators";
import {
    kmphToMph,
    metersToKilometers,
    metersToMiles,
    mpsToKmph,
    mpsToMph,
    secondsToDurationObj
} from "./converters";
import { normaliseTimestamp } from "./date-utils";


export interface DistanceOpts {
	distanceUntilScored?: number;
	unitPreference?: DistanceUnitPreference;
	precision?: DistancePrecisionPreference;
	locale?: LocalePreference | undefined;
}

export function distance({
	unitPreference = "km",
	precision = 0,
	locale = undefined,
}: DistanceOpts = {}): (distanceInMetres: number | string) => string {
	const formatter = Intl.NumberFormat(locale, {
		style: "decimal",
		useGrouping: true,
		minimumFractionDigits: precision,
		maximumFractionDigits: precision,
	});

	return function (distanceInMetres: number | string) {
		switch (unitPreference) {
			case "km":
				return `${formatter.format(metersToKilometers(Number(distanceInMetres)))} km`;
			case "mi":
				return `${formatter.format(metersToMiles(Number(distanceInMetres)))} mi`;
		}
	};
}

export function distanceUntilScored({
	unitPreference = "km",
	distanceUntilScored = 160934,
	precision = 0,
	locale = undefined,
}: DistanceOpts = {}): (distanceCompletedInMetres: number | string) => string {
	const formatter = Intl.NumberFormat(locale, {
		style: "decimal",
		useGrouping: true,
		minimumFractionDigits: precision,
		maximumFractionDigits: precision,
	});

	return function (distanceCompletedInMetres: number | string) {
		const progress = blockDistanceRemaining(distanceUntilScored, Number(distanceCompletedInMetres));

		switch (unitPreference) {
			case "km":
				return `${formatter.format(metersToKilometers(progress))} km`;
			case "mi":
				return `${formatter.format(metersToMiles(progress))} mi`;
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
	distanceInMetres: number | string,
	durationInSeconds: number | string
) => string {
	const formatter = new Intl.NumberFormat(locale, {
		style: "decimal",
		useGrouping: true,
		minimumFractionDigits: precision,
		maximumFractionDigits: precision,
	});
	return function (distanceInMetres: number | string, durationInSeconds: number | string) {
		const metresPerSecond = Number(distanceInMetres) / Number(durationInSeconds);

		switch (unitPreference) {
			case "km":
				return `${formatter.format(mpsToKmph(metresPerSecond))} km/h`;
			case "mi":
				return `${formatter.format(mpsToMph(metresPerSecond))} mph`;
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
		const date = new Date(normaliseTimestamp(timestamp));
		return formatter.format(date);
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
		const date = new Date(normaliseTimestamp(timestamp));
		return formatter.format(date);
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
		const date = new Date(normaliseTimestamp(timestamp));
		return formatter.format(date);
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
		const hrSuffix = hours === 1 ? "hr" : "hrs";
		const minSuffix = minutes === 1 ? "min" : "mins";

		switch (displayStyle) {
			case "compact":
				return `${hourFormatter.format(hours)}:${minuteFormatter.format(minutes)}`;
			case "expanded":
				if (!hours && minutes) {
					return `${minuteFormatter.format(minutes)} ${minSuffix}`;
				} else if (hours && !minutes) {
					return `${hourFormatter.format(hours)} ${hrSuffix}`;
				} else {
					return `${hourFormatter.format(hours)} ${hrSuffix}, ${minuteFormatter.format(minutes)} ${minSuffix}`;
				}
		}
	};
}
