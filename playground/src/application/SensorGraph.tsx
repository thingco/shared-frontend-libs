import { Box, Flex, Grid, Text } from "theme-ui";
import React from "react";

import { Graph } from "@thingco/graphviz-web";

import sensorData from "./SensorData";

interface annotation {
	colour: string;
	title: string;
}

export type SensorData = {
	Min: number;
	Max: number;
	Avg: number;
};

interface Props {
	data: SensorData[];
	title?: string;
	anno1?: annotation;
	anno2?: annotation;
	anno3?: annotation;
}

interface CoordinateIndex {
	locationIndex: number;
	setLocationIndex: (i: number) => void;
}

const CoordinateIndexContext = React.createContext<CoordinateIndex | null>(null);

export const CoordinateIndexProvider = ({
	children,
}: {
	children: React.ReactNode;
}): JSX.Element => {
	const [locationIndex, setLocationIndex] = React.useState<number>(0);

	return (
		<CoordinateIndexContext.Provider value={{ locationIndex, setLocationIndex }}>
			{children}
		</CoordinateIndexContext.Provider>
	);
};

function useCoordinateIndex(): CoordinateIndex {
	const val = React.useContext(CoordinateIndexContext);

	if (!val) throw new Error("Nee context here mayte");

	return val;
}

export const SensorGraph = () => (
	<CoordinateIndexProvider>
		<Flex sx={{ height: "100vh", width: "100vw" }}>
			<TripGraph
				data={sensorData.Data.Az}
				title="Changes in X per second"
				anno1={{ colour: "grey", title: "Average X" }}
				anno2={{ colour: "orangered", title: "Max X" }}
				anno3={{ colour: "royalblue", title: "Min X" }}
			/>
		</Flex>
	</CoordinateIndexProvider>
);

export const TripGraph = React.memo(
	({
		data,
		anno1 = { colour: "grey", title: "Average" },
		anno2 = { colour: "orangered", title: "Max" },
		anno3 = { colour: "royalblue", title: "Min" },
	}: Props): JSX.Element => {
		const { locationIndex, setLocationIndex } = useCoordinateIndex();
		const xmin: number[] = [];
		const xmax: number[] = [];
		const xavg: number[] = [];

		data.map((d, i) => {
			xmin.push(parseFloat(d.Min.toFixed(2)));
			xmax.push(parseFloat(d.Max.toFixed(2)));
			xavg.push(parseFloat(d.Avg.toFixed(2)));
		});

		console.log(xmin.length);
		const highest = Math.max(Math.max(...xmin), Math.max(...xmax));
		const lowest = Math.min(Math.min(...xmin), Math.min(...xmax));

		return (
			<Flex sx={{ flexDirection: "column", alignItems: "center", marginTop: "small", mx: 5 }}>
				<Grid data-testid="tripgraph" sx={{ gridTemplateColumns: "1fr", height: 300 }}>
					<Box style={{ gridRowStart: 1, gridColumnStart: 1, zIndex: 1 }}>
						<Graph
							yAxisValues={xavg}
							yAxisMin={lowest}
							yAxisMax={highest}
							yAxisSize={250}
							yAxisStep={0.2}
							// xAxisScale={10}
							xAxisScale={4}
							xAxisStep={10}
						>
							<Graph.Canvas
								// height={300}
								style={{ height: 300 }}
								padding={{
									left: 35,
									right: 0,
									top: 0,
									bottom: 0,
								}}
							>
								<Graph.YAxis />
								<Graph.YAxisAnnotations offsetX={-10} style={{ fontSize: 10 }} />
							</Graph.Canvas>
						</Graph>
					</Box>
					<Box style={{ gridRowStart: 1, gridColumnStart: 1, zIndex: 1 }}>
						<Graph
							yAxisValues={xavg}
							yAxisMin={lowest}
							yAxisMax={highest}
							yAxisSize={250}
							yAxisStep={0.2}
							// xAxisScale={10}
							xAxisScale={4}
							xAxisStep={10}
						>
							<Graph.CanvasWithScrubber
								currentDataPointIndex={locationIndex}
								height={300}
								padding={{
									left: 40,
									right: 100,
									top: 0,
									bottom: 0,
								}}
							>
								<Graph.YAxisGridLines style={{ opacity: 0.25 }} />

								<Graph.DataLine style={{ stroke: anno1.colour, strokeWidth: 1 }} />
								<Graph.XAxis showSteps={true} position="top" />
								<Graph.XAxisAnnotations
									offsetY={-10}
									style={{ fontSize: 8 }}
									position="top"
									roundTo={0}
								/>
								<Graph.ScrubberHorizontal
									currentDataPointIndex={locationIndex}
									setCurrentDataPointIndex={setLocationIndex}
									startPosition="left"
									thumbStyle={{
										stroke: "blue",
										strokeWidth: 4,
									}}
								/>
							</Graph.CanvasWithScrubber>
						</Graph>
					</Box>
					<Box style={{ gridRowStart: 1, gridColumnStart: 1 }}>
						<Graph
							yAxisValues={xmax}
							yAxisMin={lowest}
							yAxisMax={highest}
							yAxisSize={200}
							yAxisStep={0.2}
							// xAxisScale={10}
							xAxisScale={4}
						>
							<Graph.CanvasWithScrubber
								currentDataPointIndex={locationIndex}
								height={300}
								padding={{
									left: 40,
									right: 100,
									top: 0,
									bottom: 0,
								}}
							>
								<Graph.DataLine style={{ stroke: anno2.colour, strokeWidth: 1 }} />
							</Graph.CanvasWithScrubber>
						</Graph>
					</Box>
					<Box style={{ gridRowStart: 1, gridColumnStart: 1 }}>
						<Graph
							yAxisValues={xmin}
							yAxisMin={lowest}
							yAxisMax={highest}
							yAxisSize={200}
							yAxisStep={0.2}
							// xAxisScale={10}
							xAxisScale={4}
						>
							<Graph.CanvasWithScrubber
								currentDataPointIndex={locationIndex}
								height={300}
								padding={{
									left: 40,
									right: 100,
									top: 0,
									bottom: 0,
								}}
							>
								<Graph.DataLine style={{ stroke: anno3.colour, strokeWidth: 1 }} />
							</Graph.CanvasWithScrubber>
						</Graph>
					</Box>
				</Grid>
				<Flex sx={{ my: "base" }}>
					<Flex
						sx={{
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center",
							mx: "base",
						}}
					>
						<Box sx={{ height: "3px", width: "20px", bg: anno1.colour, mx: 5 }} />
						<Text>{anno1.title}</Text>
					</Flex>
					<Flex
						sx={{
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center",
							mx: "base",
						}}
					>
						<Box sx={{ height: "3px", width: "20px", bg: anno2.colour, mx: 5 }} />
						<Text>{anno2.title}</Text>
					</Flex>
					<Flex
						sx={{
							flexDirection: "row",
							justifyContent: "center",
							alignItems: "center",
							mx: "base",
						}}
					>
						<Box sx={{ height: "3px", width: "20px", bg: anno3.colour, mx: 5 }} />
						<Text>{anno3.title}</Text>
					</Flex>
				</Flex>
			</Flex>
		);
	}
);
