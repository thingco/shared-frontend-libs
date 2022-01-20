import { date, dateTime, distance, duration, speed, time, TimeOpts } from "./formatters";

describe("distance in kilometres", () => {
	const dist = distance({ locale: "en-GB" });

	for (const [m, km] of [
		[1000, "1 km"],
		[10000, "10 km"],
		[45678, "46 km"],
		[99999.9, "100 km"],
		[999999.9, "1,000 km"],
	])
		it(`formats a distance of ${m} meters as "${km}" using default settings`, () => {
			expect(dist(+m)).toEqual(km);
		});
});

describe("distance in miles", () => {
	const dist = distance({ locale: "en-GB", unitPreference: "mi", precision: 1 });

	for (const [m, mi] of [
		[1000, "0.6 mi"],
		[10000, "6.2 mi"],
		[45678, "28.4 mi"],
		[99999.9, "62.1 mi"],
		[999999.9, "621.4 mi"],
	])
		it(`formats a distance of ${m} meters as "${mi}" when unit pref is "mile" and precision set to 1`, () => {
			expect(dist(+m)).toEqual(mi);
		});
});

describe("speed in miles per hour", () => {
	const sp = speed({ locale: "en-GB" });

	for (const [kmphNum, kmphStr] of [
		[1, "1 km/h"],
		[20, "20 km/h"],
		[55.9, "56 km/h"],
		[110.555, "111 km/h"],
	])
		it(`formats a speed of ${kmphNum} kilometers per hour as "${kmphStr}" with default preferences`, () => {
			expect(sp(+kmphNum)).toEqual(kmphStr);
		});
});

describe("speed in miles per hour", () => {
	const sp = speed({ locale: "en-GB", unitPreference: "mi", precision: 1 });

	for (const [kmph, mph] of [
		[1, "0.6 mph"],
		[20, "12.4 mph"],
		[55.9, "34.7 mph"],
		[110.555, "68.7 mph"],
	])
		it(`formats a speed of ${kmph} kilometers per hour as "${mph}" when unit preference is "mile" and precision is set to 1`, () => {
			expect(sp(+kmph)).toEqual(mph);
		});
});

const thurs9Jul2020at2054 = 1594324475214;
const thurs9Jul2020at0854 = 1594279801000;

xdescribe("time in hours and minutes", () => {
	for (const [secs, formattedTime, opts] of [
		[thurs9Jul2020at0854, "08:30", { locale: "en-GB" }],
		[thurs9Jul2020at2054, "20:54", { locale: "en-GB" }],
		[thurs9Jul2020at0854, "8:30 am", { locale: "en-GB", hour12: true }],
		[thurs9Jul2020at2054, "8:54 pm", { locale: "en-GB", hour12: true }],
	])
		it(`formats a timestamp of ${secs} as "${formattedTime}" with ${JSON.stringify(opts)}`, () => {
			expect(time(opts as TimeOpts)(+secs)).toEqual(formattedTime);
		});
});

xdescribe("date time", () => {
	for (const [secs, formattedTime, opts] of [
		[thurs9Jul2020at0854, "09/07/2020, 08:30:01", { locale: "en-GB" }],
		[thurs9Jul2020at2054, "09/07/2020, 20:54:35", { locale: "en-GB" }],
		[thurs9Jul2020at0854, "09/07/2020, 8:30 am", { locale: "en-GB", hour12: false }],
		[thurs9Jul2020at2054, "09/07/2020, 8:54 pm", { locale: "en-GB", hour12: true }],
	])
		it(`formats a timestamp of ${secs} as "${formattedTime}" with ${JSON.stringify(opts)}`, () => {
			expect(dateTime(opts as TimeOpts)(+secs)).toEqual(formattedTime);
		});
});

xdescribe("date", () => {
	for (const [secs, formattedDate, opts] of [
		[thurs9Jul2020at0854, "09/07/2020", { locale: "en-GB" }],
		[thurs9Jul2020at2054, "09/07/2020", { locale: "en-GB" }],
	])
		it(`formats a timestamp of ${secs} as "${formattedDate}" with ${JSON.stringify(opts)}`, () => {
			expect(date(opts as TimeOpts)(+secs)).toEqual(formattedDate);
		});
});

describe("duration in seconds", () => {
	for (const [s, displayStyle, d] of [
		["1000", "compact", "00:16:40"],
		["1000", "expanded", "16 mins, 40 secs"],
		["12345", "compact", "03:25:45"],
		["12345", "expanded", "3 hrs, 25 mins, 45 secs"],
		["10800", "compact", "03:00:00"],
		["10800", "expanded", "3 hrs"],
	])
		it(`formats a duration of ${s} as ${d} with display preference of "${displayStyle}"`, () => {
			expect(
				duration({ locale: "en-GB", displayStyle: displayStyle as "compact" | "expanded" })(+s)
			).toEqual(d);
		});
});
