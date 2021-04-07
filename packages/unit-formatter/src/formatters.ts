import { kmphToMph, metersToKilometers, metersToMiles, secondsToDurationObj } from "./converters";

export type DistanceUnit = "km" | "mi";

export interface DistanceOpts {
	unitPreference?: DistanceUnit;
	precision?: number;
	locale?: string | undefined;
}

/**
 * @param root0
 * @param root0.unitPreference
 * @param root0.precision
 * @param root0.locale
 */
export function distance({
	unitPreference = "km",
	precision = 0,
	locale = undefined,
}: DistanceOpts = {}): (distanceInMeters: number) => string {
	const formatter = Intl.NumberFormat(locale, {
		style: "decimal",
		useGrouping: true,
		minimumFractionDigits: precision,
		maximumFractionDigits: precision,
	});

	return function (distanceInMeters: number) {
		switch (unitPreference) {
			case "km":
				return `${formatter.format(metersToKilometers(distanceInMeters))} km`;
			case "mi":
				return `${formatter.format(metersToMiles(distanceInMeters))} mi`;
		}
	};
}

export interface SpeedOpts {
	unitPreference?: DistanceUnit;
	precision?: number;
	locale?: string | undefined;
}

/**
 * @param root0
 * @param root0.unitPreference
 * @param root0.precision
 * @param root0.locale
 */
export function speed({
	unitPreference = "km",
	precision = 0,
	locale = undefined,
}: SpeedOpts = {}): (speedInKmph: number) => string {
	const formatter = new Intl.NumberFormat(locale, {
		style: "decimal",
		useGrouping: true,
		minimumFractionDigits: precision,
		maximumFractionDigits: precision,
	});
	return function (speedInKmph: number) {
		switch (unitPreference) {
			case "km":
				return `${formatter.format(speedInKmph)} km/h`;
			case "mi":
				return `${formatter.format(kmphToMph(speedInKmph))} mph`;
		}
	};
}

export interface DateOpts {
	locale?: string;
}

/**
 * @param root0
 * @param root0.locale
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
		return formatter.format(new Date(timestamp));
	};
}

export interface TimeOpts {
	locale?: string;
	hour12?: boolean;
}

/**
 * @param root0
 * @param root0.locale
 * @param root0.hour12
 */
export function time({ locale = undefined, hour12 = false }: TimeOpts = {}): (
	timestamp: string | number
) => string {
	const formatter = new Intl.DateTimeFormat(locale, {
		hour: hour12 ? "numeric" : "2-digit",
		minute: "2-digit",
		hour12,
	});

	return function (timestamp: string | number) {
		return formatter.format(new Date(timestamp));
	};
}

export interface DateTimeOpts {
	locale?: string;
	hour12?: boolean;
}

/**
 * @param root0
 * @param root0.locale
 * @param root0.hour12
 */
export function dateTime({ locale = undefined, hour12 = false }: DateTimeOpts = {}): (
	timestamp: string | number
) => string {
	const formatter = new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: hour12 ? "numeric" : "2-digit",
		minute: "2-digit",
		hour12,
	});

	return function (timestamp: string | number) {
		return formatter.format(new Date(timestamp));
	};
}

export interface DurationOpts {
	locale?: string | undefined;
	displayStyle?: "compact" | "expanded";
}

/**
 * @param root0
 * @param root0.locale
 * @param root0.displayStyle
 */
export function duration({ locale = undefined, displayStyle = "compact" }: DurationOpts = {}): (
	durationInSeconds: number
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

	return function (durationInSeconds: number): string {
		const { hours, minutes } = secondsToDurationObj(durationInSeconds);
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
