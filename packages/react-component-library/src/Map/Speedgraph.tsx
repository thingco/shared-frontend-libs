import React from "react";

import { useMapData } from "./DataProvider";
import { useSpeedgraphConfig } from "./Speedgraph/ConfigProvider";
import { PointSpeedDots } from "./Speedgraph/PointSpeedDots";
import { PointSpeedLines } from "./Speedgraph/PointSpeedLines";
import { PointSpeedPolylines } from "./Speedgraph/PointSpeedPolylines";
import { RoadSpeeds } from "./Speedgraph/RoadSpeeds";
import { SpeedGridLines } from "./Speedgraph/SpeedGridLines";

/**
 *
 * @visibleName Map.Speedgraph
 */
export const Speedgraph = (): JSX.Element | null => {
	const { pointSpeeds, roadSpeeds } = useMapData();
	const {
		graphType,
		showRoadSpeeds,
		showSpeedGrid,
		xScale,
		yScale,
		strokeWidth,
	} = useSpeedgraphConfig();

	// if (pointSpeeds.length === 0 && roadSpeeds.length === 0) return null;

	// Cache the calculated width/height values. Note that the scale, the speeds
	// and the number of speed points are still needed throughout the speedgraph components
	// for calculations, so cannot be moved up into the config state.
	const width = roadSpeeds.length * xScale;
	const height =
		pointSpeeds.length > 0
			? Math.max(Math.max(...pointSpeeds), Math.max(...roadSpeeds)) * yScale
			: 0;

	return (
		<svg
			// TODO: pad the graph by, say, 10px. This requires altering the viewbox coords,
			// but also then alters the overall sizings, which cascades through the subcomponents,
			// so requires some careful changes.
			viewBox={`0 0  ${width} ${height}`}
			width="100%"
			height="auto"
		>
			{/* NOTE: SVG coordinates are from TOP LEFT. But the graph coordinates are from BOTTOM LEFT.
			 * The following transform flips the grid vertically so that it is the right way up: */}
			<g transform={`matrix(1 0 0 -1 0 ${height})`}>
				{showRoadSpeeds ? (
					<RoadSpeeds
						roadSpeeds={roadSpeeds}
						xScale={xScale}
						yScale={yScale}
						strokeWidth={strokeWidth}
					/>
				) : null}
				{showSpeedGrid ? <SpeedGridLines width={width} height={height} yScale={yScale} /> : null}
				{graphType === "POLYLINE" ? (
					<PointSpeedPolylines
						pointSpeeds={pointSpeeds}
						roadSpeeds={roadSpeeds}
						strokeWidth={strokeWidth}
						xScale={xScale}
						yScale={yScale}
					/>
				) : graphType === "LINE" ? (
					<PointSpeedLines
						pointSpeeds={pointSpeeds}
						roadSpeeds={roadSpeeds}
						strokeWidth={strokeWidth}
						xScale={xScale}
						yScale={yScale}
					/>
				) : graphType === "DOT" ? (
					<PointSpeedDots
						pointSpeeds={pointSpeeds}
						roadSpeeds={roadSpeeds}
						strokeWidth={strokeWidth}
						xScale={xScale}
						yScale={yScale}
					/>
				) : null}
			</g>
		</svg>
	);
};
