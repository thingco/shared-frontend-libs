import {
	date,
	dateTime,
	distance,
	duration,
	speed,
	time,
	TimeOpts,
	DateDisplayFormat,
} from "@thingco/data-transformers-core";
import { strict as assert } from "assert";
import { suite } from "uvu";
import * as fc from "fast-check";


// groups of thousands should be delimited with a comma
//

// ---

const distanceInKilometres = suite("distance in kilometres");

distanceInKilometres.before((ctx) => {
	ctx.dist = distance({ locale: "en-GB" });
})

for (const [m, km] of [
	[1000, "1 km"],
	[10000, "10 km"],
	[45678, "46 km"],
	[99999.9, "100 km"],
	[999999.9, "1,000 km"],
]) {
	distanceInKilometres(`formats a distance of ${m} meters as "${km}" using default settings`, (ctx) => {
		assert.equal(ctx.dist(+m), km);
	});
}

distanceInKilometres.run();

// ---

const distanceInMiles = suite("distance in miles");

distanceInMiles.before((ctx) => {
	ctx.dist = distance({ locale: "en-GB", distanceUnit: "mi", precision: 1 });
});

for (const [m, mi] of [
	[1000, "0.6 mi"],
	[10000, "6.2 mi"],
	[45678, "28.4 mi"],
	[99999.9, "62.1 mi"],
	[999999.9, "621.4 mi"],
]) {
	distanceInMiles(`formats a distance of ${m} meters as "${mi}" when unit pref is "mile" and precision set to 1`, (ctx) => {
		assert.equal(ctx.dist(+m), mi);
	});
}

distanceInMiles.run();

// ---

const speedInKilometresPerHour = suite("speed in miles per hour");

speedInKilometresPerHour.before((ctx) => {
	ctx.sp = speed({ locale: "en-GB" });
});

for (const [kmphNum, kmphStr] of [
	[1, "1 km/h"],
	[20, "20 km/h"],
	[55.9, "56 km/h"],
	[110.555, "111 km/h"],
]) {
	speedInKilometresPerHour(`formats a speed of ${kmphNum} kilometers per hour as "${kmphStr}" with default preferences`, (ctx) => {
		assert.equal(ctx.sp(+kmphNum), kmphStr);
	});
}

speedInKilometresPerHour.run();

// ---

const speedInMilesPerHour = suite("speed in miles per hour");

speedInMilesPerHour.before((ctx) => {
	ctx.sp = speed({ locale: "en-GB", distanceUnit: "mi", precision: 1 });
});

for (const [kmph, mph] of [
	[1, "0.6 mph"],
	[20, "12.4 mph"],
	[55.9, "34.7 mph"],
	[110.555, "68.7 mph"],
]) {
	speedInMilesPerHour(`formats a speed of ${kmph} kilometers per hour as "${mph}" when unit preference is "mile" and precision is set to 1`, (ctx) => {
		assert.equal(ctx.sp(+kmph), mph);
	});
}

speedInMilesPerHour.run();

// ---

const thurs9Jul2020at2054 = 1594324475214;
const thurs9Jul2020at0854 = 1594279800000;

const timeInHoursAndMinutes = suite("time in hours and minutes");

for (const [secs, formattedTime, opts] of [
	[thurs9Jul2020at0854, "08:30", { locale: "en-GB" }],
	[thurs9Jul2020at2054, "20:54", { locale: "en-GB" }],
	[thurs9Jul2020at0854, "8:30 am", { locale: "en-GB", timeDisplay: "12" }],
	[thurs9Jul2020at2054, "8:54 pm", { locale: "en-GB", timeDisplay: "12" }],
]) {
	timeInHoursAndMinutes(`formats a timestamp of ${secs} as "${formattedTime}" with ${JSON.stringify(opts)}`, () => {
		const t = time(opts as TimeOpts);
		assert.equal(t(+secs), formattedTime);
	});
}

timeInHoursAndMinutes.run();

// ---

const dateTimeFormatter = suite("date time");

for (const [secs, formattedTime, opts] of [
	[thurs9Jul2020at0854, "09/07/2020, 08:30", { locale: "en-GB" }],
	[thurs9Jul2020at2054, "09/07/2020, 20:54", { locale: "en-GB" }],
	[thurs9Jul2020at0854, "09/07/2020, 8:30 am", { locale: "en-GB", timeDisplay: "12" }],
	[thurs9Jul2020at2054, "09/07/2020, 8:54 pm", { locale: "en-GB", timeDisplay: "12" }],
]) {
	dateTimeFormatter(`formats a timestamp of ${secs} as "${formattedTime}" with ${JSON.stringify(opts)}`, () => {
		const dt = dateTime(opts as TimeOpts);
		assert.equal(dt(+secs), formattedTime);
	});
}

dateTimeFormatter.run();

// ---

const dateFormatter = suite("date");

for (const [secs, formattedDate, opts] of [
	[thurs9Jul2020at0854, "09/07/2020", { locale: "en-GB" }],
	[thurs9Jul2020at2054, "09/07/2020", { locale: "en-GB" }],
]) {
	dateFormatter(`formats a timestamp of ${secs} as "${formattedDate}" with ${JSON.stringify(opts)}`, () => {
		const d = date(opts as TimeOpts);
		assert.equal(d(+secs), formattedDate);
	});
}

dateFormatter.run();

// ---

const durationInSeconds = suite("duration in seconds");

for (const [s, dateDisplayFormat, d] of [
	["1000", "compact", "00:16"],
	["1000", "expanded", "16 mins"],
	["12345", "compact", "03:25"],
	["12345", "expanded", "3 hrs, 25 mins"],
	["10800", "compact", "03:00"],
	["10800", "expanded", "3 hrs"],
]) {
	durationInSeconds(`formats a duration of ${s} as ${d} with display preference of "${dateDisplayFormat}"`, () => {
		const dur = duration({ locale: "en-GB", dateDisplayFormat: dateDisplayFormat as DateDisplayFormat });
			assert.equal(dur(+s), d);
	});
}

durationInSeconds.run();
