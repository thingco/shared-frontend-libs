// TODO: convert everything to property checks
// import * as fc from "fast-check";
import {
    kmphToMph,
    metersToKilometers as mToKm,
    metersToMiles as mToMi,
		roundTo,
		secondsToDurationObj as sToDurationObj
} from "@thingco/data-transformers-core";
import { strict as assert } from "assert";
import { test } from "uvu";


for (const [input, fractionalDigits, output] of [
	[1, 0, 1],
	[1.1, 0, 1],
	[1.245, 1, 1.2],
	[1.245, 2, 1.25],
	[1.005, 2, 1.01],
]) {
	test(`\`roundTo()\` rounds input of ${input} to ${output} when fractionalDigits is ${fractionalDigits}`, () => {
		assert.equal(roundTo(input, fractionalDigits), output);
	});
}

for (const [input, output] of [
	[1, 0],
	[1000, 1],
	[45678, 45.7],
	[1234567.89, 1234.6],
	[9999999.99999, 10000],
]) {
	test(`\`mToKm()\` converts ${input} meters to ${output} kilometers`, () => {
		assert.equal(mToKm(input, 1), output);
	});
}

for (const [input, output] of [
	[1, 0],
	[1000, 0.6],
	[45678, 28.4],
	[1234567.89, 767.1],
	[9999999.99999, 6213.7],
]) {
	test(`\`mToMi()\` converts ${input} meters to ${output} miles`, () => {
		assert.equal(mToMi(input, 1), output);
	});
}

for (const [input, output] of [
	[1, 0.6],
	[20, 12.4],
	[55.9, 34.7],
	[110.555, 68.7],
]) {
	test(`\`kmphToMph()\` converts ${input} kilometres per hour to ${output} miles per hour`, () => {
		assert.equal(kmphToMph(input, 1), output);
	});
}

for (const [input, output] of [
	[1, { hours: 0, minutes: 0, seconds: 1 }],
	[100, { hours: 0, minutes: 1, seconds: 40 }],
	[1000, { hours: 0, minutes: 16, seconds: 40 }],
	[12345, { hours: 3, minutes: 25, seconds: 45 }],
]) {
	test(`\`sToDurationObj()\` converts ${input} seconds to ${JSON.stringify(output)} duration`, () => {
		assert.deepEqual(sToDurationObj(input as number), output);
	});
}

test.run();
