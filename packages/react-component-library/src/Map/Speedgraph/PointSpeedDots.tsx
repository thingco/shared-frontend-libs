import React from "react";
import shortid from "shortid";
import { useThemeUI } from "theme-ui";

import { generateDotCoordinates, tagSpeeds, zipSpeeds } from "./utilities";

import type { DotCoordinate } from "../types";

export interface PointSpeedDotsProps {
	pointSpeeds: number[];
	roadSpeeds: number[];
	strokeWidth: number;
	xScale: number;
	yScale: number;
}

export const PointSpeedDots = ({
	pointSpeeds,
	roadSpeeds,
	strokeWidth = 4,
	xScale = 1,
	yScale = 1,
}: PointSpeedDotsProps): JSX.Element => {
	const dotCoordinates = [...generateDotCoordinates(tagSpeeds(zipSpeeds(pointSpeeds, roadSpeeds)))];

	const { theme } = useThemeUI();

	return (
		<g>
			{dotCoordinates.map(({ tag, dotCoordinates }: DotCoordinate) => (
				<circle
					key={shortid.generate()}
					fill={
						(tag === "BELOW"
							? theme.colors?.gauge_high
							: tag === "ON"
							? theme.colors?.gauge_medium
							: theme.colors?.gauge_low) as string
					}
					cx={dotCoordinates.x * xScale}
					cy={dotCoordinates.y * yScale}
					r={strokeWidth}
				/>
			))}
		</g>
	);
};
