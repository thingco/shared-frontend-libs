import { generatePolyPoints, mergeSpeeds, tagSpeeds, zipSpeeds } from "./utilities";

import type { SpeedTag, PolylineCoordinate, DotCoordinate, LineCoordinate } from "../types";

describe("speedgraph point speed polyline builder", () => {
	it("zips", () => {
		const speeds = [10, 11, 12, 13, 14, 15, 14, 13, 12, 11, 10];
		const maxSpeeds = [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13];
		const output = [
			[10, 13],
			[11, 13],
			[12, 13],
			[13, 13],
			[14, 13],
			[15, 13],
			[14, 13],
			[13, 13],
			[12, 13],
			[11, 13],
			[10, 13],
		];

		expect([...zipSpeeds(speeds, maxSpeeds)]).toEqual(output);
	});

	it("tags", () => {
		const input: [number, number][] = [
			[10, 13],
			[11, 13],
			[12, 13],
			[13, 13],
			[14, 13],
			[15, 13],
			[14, 13],
			[13, 13],
			[12, 13],
			[11, 13],
			[10, 13],
		];
		const output = [
			{ tag: "BELOW", speed: 10 },
			{ tag: "BELOW", speed: 11 },
			{ tag: "BELOW", speed: 12 },
			{ tag: "ON", speed: 13 },
			{ tag: "ABOVE", speed: 14 },
			{ tag: "ABOVE", speed: 15 },
			{ tag: "ABOVE", speed: 14 },
			{ tag: "ON", speed: 13 },
			{ tag: "BELOW", speed: 12 },
			{ tag: "BELOW", speed: 11 },
			{ tag: "BELOW", speed: 10 },
		];

		expect([...tagSpeeds(input)]).toEqual(output);
	});

	it("merges", () => {
		const input: { tag: SpeedTag; speed: number }[] = [
			{ tag: "BELOW", speed: 10 },
			{ tag: "BELOW", speed: 11 },
			{ tag: "BELOW", speed: 12 },
			{ tag: "ON", speed: 13 },
			{ tag: "ABOVE", speed: 14 },
			{ tag: "ABOVE", speed: 15 },
			{ tag: "ABOVE", speed: 14 },
			{ tag: "ON", speed: 13 },
			{ tag: "BELOW", speed: 12 },
			{ tag: "BELOW", speed: 11 },
			{ tag: "BELOW", speed: 10 },
		];
		const output: { tag: SpeedTag; speeds: number[] }[] = [
			{ tag: "BELOW", speeds: [10, 11, 12] },
			{ tag: "ON", speeds: [13] },
			{ tag: "ABOVE", speeds: [14, 15, 14] },
			{ tag: "ON", speeds: [13] },
			{ tag: "BELOW", speeds: [12, 11, 10] },
		];

		expect([...mergeSpeeds(input)]).toEqual(output);
	});

	it("converts to polyline points", () => {
		const input: { tag: SpeedTag; speeds: number[] }[] = [
			{ tag: "BELOW", speeds: [10, 11, 12] },
			{ tag: "ON", speeds: [13] },
			{ tag: "ABOVE", speeds: [14, 15, 14] },
			{ tag: "ON", speeds: [13] },
			{ tag: "BELOW", speeds: [12, 11, 10] },
		];
		const output: PolylineCoordinate[] = [
			{
				tag: "BELOW",
				polylineCoordinates: [
					{ x: 0, y: 10 },
					{ x: 1, y: 11 },
					{ x: 2, y: 12 },
				],
			},
			{
				tag: "ON",
				polylineCoordinates: [
					{ x: 2, y: 12 },
					{ x: 3, y: 13 },
				],
			},
			{
				tag: "ABOVE",
				polylineCoordinates: [
					{ x: 3, y: 13 },
					{ x: 4, y: 14 },
					{ x: 5, y: 15 },
					{ x: 6, y: 14 },
				],
			},
			{
				tag: "ON",
				polylineCoordinates: [
					{ x: 6, y: 14 },
					{ x: 7, y: 13 },
				],
			},
			{
				tag: "BELOW",
				polylineCoordinates: [
					{ x: 7, y: 13 },
					{ x: 8, y: 12 },
					{ x: 9, y: 11 },
					{ x: 10, y: 10 },
				],
			},
		];

		expect([...generatePolyPoints(input)]).toEqual(output);
	});

	it("zips, merges and tags", () => {
		const speeds = [10, 11, 12, 13, 14, 15, 14, 13, 12, 11, 10];
		const maxSpeeds = [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13];

		const output: { tag: SpeedTag; speeds: number[] }[] = [
			{ tag: "BELOW", speeds: [10, 11, 12] },
			{ tag: "ON", speeds: [13] },
			{ tag: "ABOVE", speeds: [14, 15, 14] },
			{ tag: "ON", speeds: [13] },
			{ tag: "BELOW", speeds: [12, 11, 10] },
		];

		expect([...mergeSpeeds(tagSpeeds(zipSpeeds(speeds, maxSpeeds)))]).toEqual(output);
	});
});
