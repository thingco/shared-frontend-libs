import type {
	DateFormat,
	DistanceUnit,
	Locale,
	TimeDisplay
} from "./types";
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
	unitPreference?: DistanceUnit;
	precision?: number;
	locale?: Locale;
}

/**
 * Factory function for creating distance formatters.
 *
 * @category Formatters
 */
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


/**
 * Factory function for creating distanceUntilScored formatters.
 *
 * @remarks
 * "Distance until scored" refers to the distance remaining (in metres) until a
 * block is scored -- this averages out by default at ~100miles, but that
 * will naturally change depending on individual journey length.
 *
 * @category Formatters
 */
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
	unitPreference?: DistanceUnit;
	precision?: number;
	locale?: Locale;
}


/**
 * Factory function for creating speed formatters.
 *
 * @category Formatters
 */
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


/**
 * Factory function for creating *average* speed formatters.
 *
 * @remarks
 * This formatter is used when what is available is distance & duration -- for
 * example, when journey data is handed to it.
 *
 * @category Formatters
 */
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
	locale?: Locale;
}

/**
 * Factory function for creating date formatters.
 *
 * @category Formatters
 */
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
	locale?: Locale;
	showSeconds?: boolean;
	timeDisplay?: TimeDisplay;
}


/**
 * Factory function for creating time formatters.
 *
 * @category Formatters
 */
export function time({ locale = undefined, showSeconds = false, timeDisplay = "24" }: TimeOpts = {}): (
	timestamp: string | number
) => string {
	const formatter = new Intl.DateTimeFormat(locale, {
		hour: timeDisplay === "12" ? "numeric" : "2-digit",
		minute: "2-digit",
		second: showSeconds ? "2-digit" : undefined,
		hour12: timeDisplay === "12",
	});

	return function (timestamp: string | number) {
		const date = new Date(normaliseTimestamp(timestamp));
		return formatter.format(date);
	};
}

export interface DateTimeOpts {
	locale?: Locale;
	showSeconds?: boolean;
	timeDisplay?: TimeDisplay;
}

/**
 * Factory function for creating dateTime formatters.
 *
 * @category Formatters
 */
export function dateTime({ locale = undefined, showSeconds = false, timeDisplay = "24" }: DateTimeOpts = {}): (
	timestamp: string | number
) => string {
	const formatter = new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: timeDisplay === "12" ? "numeric" : "2-digit",
		minute: "2-digit",
		second: showSeconds ? "2-digit" : undefined,
		hour12: timeDisplay === "12",
	});

	return function (timestamp: string | number) {
		const date = new Date(normaliseTimestamp(timestamp));
		return formatter.format(date);
	};
}

export interface DurationOpts {
	locale?: Locale;
	displayStyle?: DateFormat;
	showSeconds?: boolean;
}

/**
 * Factory function for creating duration formatters.
 *
 * @category Formatters
 */
export function duration({ locale = undefined, displayStyle = "compact", showSeconds = false }: DurationOpts = {}): (
	durationInSeconds: number | string
) => string {
	const numberFormatter = new Intl.NumberFormat(locale, {
		style: "decimal",
		minimumIntegerDigits: displayStyle === "expanded" ? 1 : 2,
		maximumFractionDigits: 0,
	});

	return function (durationInSeconds: number | string): string {
		const { hours, minutes, seconds } = secondsToDurationObj(Number(durationInSeconds));

		const hrSuffix = hours === 1 ? "hr" : "hrs";
		const minSuffix = minutes === 1 ? "min" : "mins";
		const secSuffix = seconds === 1 ? "sec" : "secs";

		switch (displayStyle) {
			case "compact":
				let compactStr = `${numberFormatter.format(hours)}:${numberFormatter.format(minutes)}`;
				if (showSeconds && seconds) compactStr += `:${numberFormatter.format(seconds)} ${secSuffix}`;
				return compactStr;
			case "expanded":
				const expandedStr = [];
				if (hours) expandedStr.push(`${numberFormatter.format(hours)} ${hrSuffix}`);
				if (minutes) expandedStr.push(`${numberFormatter.format(minutes)} ${minSuffix}`);
				if (showSeconds && seconds) expandedStr.push(`${numberFormatter.format(seconds)} ${secSuffix}`);
				return expandedStr.join(", ");
		}
	};
}
