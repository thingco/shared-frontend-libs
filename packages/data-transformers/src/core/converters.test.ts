import { kmphToMph, metersToKilometers, metersToMiles, secondsToDurationObj } from "./converters";
import { roundTo } from "./math-utils";

describe.each([
	[1, 0, 1],
	[1.1, 0, 1],
	[1.245, 1, 1.2],
	[1.245, 2, 1.25],
	[1.005, 2, 1.01],
])("converters: roundTo(%f, %i)", (num, precision, rounded) => {
	it(`rounds input of ${num} to ${rounded} when precision is ${precision}`, () => {
		expect(roundTo(num, precision)).toEqual(rounded);
	});
});

describe.each([
	[1, 0],
	[1000, 1],
	[45678, 45.7],
	[1234567.89, 1234.6],
	[9999999.99999, 10000],
])("converters: metersToKilometers(%f) [NOTE, precision 1]", (m, km) => {
	it(`converts ${m} meters to ${km} kilometers`, () => {
		expect(metersToKilometers(m, 1)).toEqual(km);
	});
});

describe.each([
	[1, 0],
	[1000, 0.6],
	[45678, 28.4],
	[1234567.89, 767.1],
	[9999999.99999, 6213.7],
])("converters: metersToMiles(%f) [NOTE, precision 1]", (m, mi) => {
	it(`converts ${m} meters to ${mi} miles`, () => {
		expect(metersToMiles(m, 1)).toEqual(mi);
	});
});

describe.each([
	[1, 0.6],
	[20, 12.4],
	[55.9, 34.7],
	[110.555, 68.7],
])("converters: kmphToMph(%f) [NOTE, precision 1]", (kmph, mph) => {
	it(`converts ${kmph} kmph speed to ${mph} mph speed`, () => {
		expect(kmphToMph(kmph, 1)).toEqual(mph);
	});
});

describe.each([
	[1, { hours: 0, minutes: 0, seconds: 1 }],
	[100, { hours: 0, minutes: 1, seconds: 40 }],
	[1000, { hours: 0, minutes: 16, seconds: 40 }],
	[12345, { hours: 3, minutes: 25, seconds: 45 }],
])("converters: secondsToDurationObj(%i)", (secs, durationObj) => {
	it(`converts ${secs} seconds to ${JSON.stringify(durationObj)}`, () => {
		expect(secondsToDurationObj(secs)).toEqual(durationObj);
	});
});
