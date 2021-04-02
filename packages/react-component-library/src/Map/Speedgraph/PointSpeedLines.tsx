import React from "react";
import shortid from "shortid";
import { useThemeUI } from "theme-ui";

import { generateLineCoordinates, tagSpeeds, zipSpeeds } from "./utilities";

import type { LineCoordinate } from "../types";

export interface PointSpeedLinesProps {
	pointSpeeds: number[];
	roadSpeeds: number[];
	strokeWidth: number;
	xScale: number;
	yScale: number;
}

export const PointSpeedLines = ({
	pointSpeeds,
	roadSpeeds,
	strokeWidth = 4,
	xScale = 1,
	yScale = 1,
}: PointSpeedLinesProps): JSX.Element => {
	const lineCoordinates = [
		...generateLineCoordinates(tagSpeeds(zipSpeeds(pointSpeeds, roadSpeeds))),
	];

	const { theme } = useThemeUI();

	return (
		<g strokeWidth={strokeWidth} fill="none">
			{lineCoordinates.map(({ tag, lineCoordinates }: LineCoordinate) => (
				<line
					key={shortid.generate()}
					x1={lineCoordinates.x1 * xScale}
					x2={lineCoordinates.x2 * xScale}
					y1={lineCoordinates.y1 * yScale}
					y2={lineCoordinates.y2 * yScale}
					stroke={
						(tag === "BELOW"
							? theme.colors?.gauge_high
							: tag === "ON"
							? theme.colors?.gauge_medium
							: theme.colors?.gauge_low) as string
					}
				/>
			))}
		</g>
	);
};
