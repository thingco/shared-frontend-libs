import React from "react";
import Svg, { Polyline } from "react-native-svg";
import { View } from "../Containers";

interface Props {
	coords: any;
	padding?: number;
	size?: number;
	stroke?: string;
	strokeWidth?: number;
}

interface LatLngProps {
	latitude: number;
	longitude: number;
}

export const PolylineToSvg = ({
	coords,
	padding = 5,
	strokeWidth = 2,
	size = 100,
	stroke = "#000",
}: Props) => {
	const latLng2point = (latLng: LatLngProps) => {
		if (isNaN(latLng.latitude) || isNaN(latLng.longitude)) {
			console.log(latLng.latitude, latLng.longitude);
			return;
		}
		return {
			x: (latLng.longitude + 180) * (256 / 360),
			y:
				256 / 2 -
				(256 * Math.log(Math.tan(Math.PI / 4 + (latLng.latitude * Math.PI) / 180 / 2))) /
					(2 * Math.PI),
		};
	};

	const tripCoords = coords.map((coord: LatLngProps) => latLng2point(coord));

	const SAMPLE_INTERVAL = 10;
	const OUTPUT_SQUARE_AXIS_LENGTH = 200;

	const xCoords: number[] = [];
	const yCoords: number[] = [];

	let xMin = tripCoords[0].x;
	let xMax = tripCoords[0].x;
	let yMin = tripCoords[0].y;
	let yMax = tripCoords[0].y;
	let xSize = 0;
	let ySize = 0;

	for (let i = 0; i < tripCoords.length; i += SAMPLE_INTERVAL) {
		const { x, y } = tripCoords[i];

		xMin = x < xMin ? x : xMin;
		xMax = x > xMax ? x : xMax;

		yMin = y < yMin ? y : yMin;
		yMax = y > yMax ? y : yMax;

		xSize = xMax - xMin;
		ySize = yMax - yMin;

		if (isNaN(x) || isNaN(y)) {
			console.log(x, y);
		} else {
			xCoords.push(x);
			yCoords.push(y);
		}
	}

	const normaliseCoord = (
		coord: number,
		subtractionValue: number,
		translationValue: number,
		conversionFactor: number
	) => {
		return Math.round((coord - subtractionValue + translationValue) * conversionFactor);
	};

	const points: string[] = [];
	const xTranslationValue = Math.max(0, ySize - xSize) / 2;
	const yTranslationValue = Math.max(0, xSize - ySize) / 2;
	const conversionFactor = OUTPUT_SQUARE_AXIS_LENGTH / Math.max(xSize, ySize, 0.000000001);

	for (let i = 0; i < xCoords.length; i++) {
		const x = normaliseCoord(xCoords[i], xMin, xTranslationValue, conversionFactor);
		const y = normaliseCoord(yCoords[i], yMin, yTranslationValue, conversionFactor);

		points.push(`${x + padding},${y + padding}`);
	}
	return (
		<View variant="centred" style={{ height: size, width: size, backgroundColor: "transparent" }}>
			<Svg
				viewBox={`0 0 ${OUTPUT_SQUARE_AXIS_LENGTH + 2 * padding} ${
					OUTPUT_SQUARE_AXIS_LENGTH + 2 * padding
				}`}
				preserveAspectRatio="xMidYMid meet"
			>
				<Polyline points={points.join(" ")} strokeWidth={strokeWidth} fill="none" stroke={stroke} />
			</Svg>
		</View>
	);
};
