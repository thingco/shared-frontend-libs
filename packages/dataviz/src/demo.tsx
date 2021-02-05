import React from "react";
import ReactDOM from "react-dom";

import { Gauge } from "./Gauge";
import { Graph } from "./Graph";

// prettier-ignore
const sampleSpeedgraphData = {
	SpeedGraph: {
		Locations: [[54.96455, -1.49052], [54.9646, -1.49075], [54.96461, -1.49099], [54.9646, -1.49116], [54.96458, -1.4917], [54.96457, -1.49189], [54.96457, -1.49189], [54.96433, -1.49186], [54.96398, -1.49176], [54.96392, -1.49173], [54.96254, -1.49123], [54.96119, -1.49062], [54.96049, -1.49029], [54.96037, -1.49016], [54.96031, -1.49002], [54.96029, -1.48989], [54.96029, -1.48989], [54.9603, -1.48974], [54.9603, -1.48974], [54.96036, -1.48964], [54.96054, -1.48934], [54.96084, -1.48885], [54.96084, -1.48885], [54.96119, -1.48823], [54.9615, -1.48767], [54.96181, -1.48706], [54.96193, -1.48678], [54.96203, -1.48652], [54.96216, -1.48608], [54.96216, -1.48608], [54.96229, -1.48574], [54.9624, -1.48545], [54.96257, -1.48491], [54.9627, -1.48445], [54.96282, -1.48395], [54.96296, -1.48327], [54.96314, -1.48218], [54.9632, -1.48174], [54.9633, -1.48104], [54.96336, -1.48067], [54.96338, -1.48054], [54.96343, -1.48022], [54.96352, -1.47985], [54.96355, -1.47973], [54.96368, -1.4792], [54.96383, -1.47868], [54.96423, -1.47747], [54.96452, -1.47662], [54.96513, -1.47494], [54.96521, -1.47472], [54.96523, -1.47468], [54.96527, -1.47459], [54.96535, -1.47452], [54.96538, -1.47449], [54.96543, -1.47449], [54.96552, -1.47447], [54.96559, -1.47442], [54.96566, -1.47434], [54.96571, -1.47428], [54.96596, -1.4739], [54.96599, -1.47371], [54.96598, -1.47364], [54.96597, -1.47355], [54.96594, -1.47341], [54.96591, -1.47336], [54.96591, -1.47336], [54.9659, -1.4732], [54.96591, -1.47308], [54.96592, -1.47301], [54.96593, -1.47292], [54.96595, -1.47283], [54.96598, -1.47273], [54.96602, -1.4726], [54.9664, -1.47158], [54.96676, -1.47061], [54.96705, -1.46981], [54.96774, -1.468], [54.96785, -1.46782], [54.9679, -1.46776], [54.9679, -1.46776], [54.96798, -1.46767], [54.96806, -1.46761], [54.96814, -1.46754], [54.96823, -1.46741], [54.96828, -1.46729], [54.96831, -1.46716], [54.96832, -1.46701], [54.96828, -1.46679], [54.96821, -1.46669], [54.96813, -1.46663], [54.968, -1.46664], [54.96794, -1.46661], [54.96794, -1.46661], [54.96781, -1.46653], [54.96752, -1.46602], [54.9674, -1.46572], [54.96728, -1.46544], [54.96696, -1.46447], [54.96668, -1.46344], [54.9664, -1.46238], [54.96561, -1.45955], [54.96556, -1.45934], [54.96481, -1.45675], [54.96475, -1.4564], [54.96474, -1.45637], [54.96475, -1.45632], [54.96475, -1.45624], [54.96474, -1.45617], [54.96472, -1.45612], [54.96469, -1.45607], [54.96466, -1.456], [54.96465, -1.45595], [54.96465, -1.45595], [54.9646, -1.45576], [54.9645, -1.45517], [54.96444, -1.45458], [54.96441, -1.45377], [54.96444, -1.45295], [54.96468, -1.45135], [54.96485, -1.45043], [54.96496, -1.44991], [54.96589, -1.44545], [54.96593, -1.44526], [54.96623, -1.4436], [54.96726, -1.43793], [54.96726, -1.43793], [54.96729, -1.43787], [54.96734, -1.43782], [54.96738, -1.4378], [54.96745, -1.43767], [54.96747, -1.4376], [54.96748, -1.43749], [54.96748, -1.43737], [54.96745, -1.43727], [54.96744, -1.43717], [54.96744, -1.43717], [54.96743, -1.43698], [54.96743, -1.43688], [54.96806, -1.43342], [54.96832, -1.43206], [54.96863, -1.43047], [54.96868, -1.43025], [54.96915, -1.42827], [54.96922, -1.42798], [54.96933, -1.42756], [54.96936, -1.42743], [54.96936, -1.42742], [54.96939, -1.42731], [54.96942, -1.42718], [54.96964, -1.42623], [54.97003, -1.42458], [54.971, -1.42049], [54.97118, -1.41974], [54.97178, -1.41728], [54.97179, -1.41727], [54.97187, -1.41719], [54.97187, -1.41719], [54.97192, -1.41716], [54.97195, -1.41716], [54.97202, -1.41715], [54.97209, -1.4171], [54.97216, -1.41701], [54.97219, -1.41688], [54.9722, -1.41674], [54.97218, -1.41658], [54.97215, -1.41649], [54.9721, -1.4164], [54.97207, -1.41635], [54.97195, -1.41588], [54.97186, -1.41428], [54.97183, -1.41365], [54.97179, -1.41285], [54.97173, -1.4115], [54.97172, -1.41133], [54.97171, -1.4112], [54.9717, -1.41075], [54.97171, -1.41074], [54.97173, -1.41072], [54.97177, -1.41069], [54.97178, -1.41068], [54.97179, -1.41068], [54.97179, -1.41068], [54.97191, -1.41065], [54.97203, -1.41059], [54.97205, -1.4106], [54.9723, -1.41067], [54.97242, -1.41072], [54.97255, -1.41077], [54.97283, -1.41088], [54.97287, -1.4109], [54.97343, -1.41115], [54.9737, -1.41124], [54.97379, -1.41127], [54.97379, -1.41127], [54.97398, -1.40989], [54.97398, -1.40989], [54.97433, -1.41006], [54.97433, -1.41006], [54.97449, -1.40913], [54.97482, -1.40745], [54.97497, -1.40656], [54.97497, -1.40656], [54.97497, -1.40656]],
		PointSpeeds: [4, 4, 4, 4, 4, 4, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 11, 11, 15, 15, 15, 15, 11, 11, 11, 11, 11, 11, 11, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 11, 11, 11, 11, 11, 11, 11, 11, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 4, 4, 5, 5, 6, 6, 6, 6, -9223372036854776000, -9223372036854776000],
		RoadSpeeds: [32, 32, 32, 32, 32, 32, 32, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32]
	}
};

// prettier-ignore
const speedgraphData = {
	locations: [[54.96455, -1.49052], [54.9646, -1.49075], [54.96461, -1.49099], [54.9646, -1.49116], [54.96458, -1.4917], [54.96457, -1.49189], [54.96457, -1.49189], [54.96433, -1.49186], [54.96398, -1.49176], [54.96392, -1.49173], [54.96254, -1.49123], [54.96119, -1.49062], [54.96049, -1.49029], [54.96037, -1.49016], [54.96031, -1.49002], [54.96029, -1.48989], [54.96029, -1.48989], [54.9603, -1.48974], [54.9603, -1.48974], [54.96036, -1.48964], [54.96054, -1.48934], [54.96084, -1.48885], [54.96084, -1.48885], [54.96119, -1.48823], [54.9615, -1.48767], [54.96181, -1.48706], [54.96193, -1.48678], [54.96203, -1.48652], [54.96216, -1.48608], [54.96216, -1.48608], [54.96229, -1.48574], [54.9624, -1.48545], [54.96257, -1.48491], [54.9627, -1.48445], [54.96282, -1.48395], [54.96296, -1.48327], [54.96314, -1.48218], [54.9632, -1.48174], [54.9633, -1.48104], [54.96336, -1.48067], [54.96338, -1.48054], [54.96343, -1.48022], [54.96352, -1.47985], [54.96355, -1.47973], [54.96368, -1.4792], [54.96383, -1.47868], [54.96423, -1.47747], [54.96452, -1.47662], [54.96513, -1.47494], [54.96521, -1.47472], [54.96523, -1.47468], [54.96527, -1.47459], [54.96535, -1.47452], [54.96538, -1.47449], [54.96543, -1.47449], [54.96552, -1.47447], [54.96559, -1.47442], [54.96566, -1.47434], [54.96571, -1.47428], [54.96596, -1.4739], [54.96599, -1.47371], [54.96598, -1.47364], [54.96597, -1.47355], [54.96594, -1.47341], [54.96591, -1.47336], [54.96591, -1.47336], [54.9659, -1.4732], [54.96591, -1.47308], [54.96592, -1.47301], [54.96593, -1.47292], [54.96595, -1.47283], [54.96598, -1.47273], [54.96602, -1.4726], [54.9664, -1.47158], [54.96676, -1.47061], [54.96705, -1.46981], [54.96774, -1.468], [54.96785, -1.46782], [54.9679, -1.46776], [54.9679, -1.46776], [54.96798, -1.46767], [54.96806, -1.46761], [54.96814, -1.46754], [54.96823, -1.46741], [54.96828, -1.46729], [54.96831, -1.46716], [54.96832, -1.46701], [54.96828, -1.46679], [54.96821, -1.46669], [54.96813, -1.46663], [54.968, -1.46664], [54.96794, -1.46661], [54.96794, -1.46661], [54.96781, -1.46653], [54.96752, -1.46602], [54.9674, -1.46572], [54.96728, -1.46544], [54.96696, -1.46447], [54.96668, -1.46344], [54.9664, -1.46238], [54.96561, -1.45955], [54.96556, -1.45934], [54.96481, -1.45675], [54.96475, -1.4564], [54.96474, -1.45637], [54.96475, -1.45632], [54.96475, -1.45624], [54.96474, -1.45617], [54.96472, -1.45612], [54.96469, -1.45607], [54.96466, -1.456], [54.96465, -1.45595], [54.96465, -1.45595], [54.9646, -1.45576], [54.9645, -1.45517], [54.96444, -1.45458], [54.96441, -1.45377], [54.96444, -1.45295], [54.96468, -1.45135], [54.96485, -1.45043], [54.96496, -1.44991], [54.96589, -1.44545], [54.96593, -1.44526], [54.96623, -1.4436], [54.96726, -1.43793], [54.96726, -1.43793], [54.96729, -1.43787], [54.96734, -1.43782], [54.96738, -1.4378], [54.96745, -1.43767], [54.96747, -1.4376], [54.96748, -1.43749], [54.96748, -1.43737], [54.96745, -1.43727], [54.96744, -1.43717], [54.96744, -1.43717], [54.96743, -1.43698], [54.96743, -1.43688], [54.96806, -1.43342], [54.96832, -1.43206], [54.96863, -1.43047], [54.96868, -1.43025], [54.96915, -1.42827], [54.96922, -1.42798], [54.96933, -1.42756], [54.96936, -1.42743], [54.96936, -1.42742], [54.96939, -1.42731], [54.96942, -1.42718], [54.96964, -1.42623], [54.97003, -1.42458], [54.971, -1.42049], [54.97118, -1.41974], [54.97178, -1.41728], [54.97179, -1.41727], [54.97187, -1.41719], [54.97187, -1.41719], [54.97192, -1.41716], [54.97195, -1.41716], [54.97202, -1.41715], [54.97209, -1.4171], [54.97216, -1.41701], [54.97219, -1.41688], [54.9722, -1.41674], [54.97218, -1.41658], [54.97215, -1.41649], [54.9721, -1.4164], [54.97207, -1.41635], [54.97195, -1.41588], [54.97186, -1.41428], [54.97183, -1.41365], [54.97179, -1.41285], [54.97173, -1.4115], [54.97172, -1.41133], [54.97171, -1.4112], [54.9717, -1.41075], [54.97171, -1.41074], [54.97173, -1.41072], [54.97177, -1.41069], [54.97178, -1.41068], [54.97179, -1.41068], [54.97179, -1.41068], [54.97191, -1.41065], [54.97203, -1.41059], [54.97205, -1.4106], [54.9723, -1.41067], [54.97242, -1.41072], [54.97255, -1.41077], [54.97283, -1.41088], [54.97287, -1.4109], [54.97343, -1.41115], [54.9737, -1.41124], [54.97379, -1.41127], [54.97379, -1.41127], [54.97398, -1.40989], [54.97398, -1.40989], [54.97433, -1.41006], [54.97433, -1.41006], [54.97449, -1.40913], [54.97482, -1.40745], [54.97497, -1.40656], [54.97497, -1.40656], [54.97497, -1.40656]],
	pointSpeeds: sampleSpeedgraphData.SpeedGraph.PointSpeeds.map((speed) => speed < 0 ? 0 : speed),
	roadSpeeds: [32, 32, 32, 32, 32, 32, 32, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32]
}

// const FASTEST_ROAD_SPEED = 490.4845989;

const App = () => {
	const [currentDataPoint, setCurrentDataPoint] = React.useState(0);
	return (
		<main>
			<section>
				<Graph
					yAxisSize={100}
					xAxisSize={100}
					yAxisValues={[49, 50, 56, 56, 71, 74, 75, 76, 78, 83]}
					yAxisMin={0}
					yAxisMax={100}
					yAxisStep={25}
					xAxisMin={1}
					xAxisMax={10}
					xAxisValues={Array.from({ length: 10 }, (_, i) => i + 1)}
				>
					<Graph.Canvas>
						<Graph.YAxisGridLines />
						<Graph.XAxisGridLines />
						<Graph.YAxis />
						<Graph.XAxis />
						<Graph.YAxisAnnotations offsetY={1} offsetX={-4} />
						<Graph.XAxisAnnotations offsetY={-6} />
						<Graph.DataLine />
						<Graph.DataDots />
						{/* <Graph.DataHorizontalLineBar /> */}
					</Graph.Canvas>
				</Graph>
			</section>
			<section>
				<Gauge value={75} strokeWidth={4} />
			</section>
			<section></section>
			<section style={{ gridColumn: "1 / 4" }}>
				<Graph
					yAxisValues={speedgraphData.pointSpeeds}
					yAxisMin={0}
					yAxisMax={Math.max(
						Math.max(...speedgraphData.pointSpeeds),
						Math.max(...speedgraphData.roadSpeeds)
					)}
					yAxisSize={200}
					yAxisStep={10}
					xAxisScale={4}
				>
					<Graph.Canvas padding={{ top: 10, right: 10, bottom: 10, left: 20 }}>
						<Graph.XAxis showSteps={false} />
						<Graph.YAxis />
						<Graph.YAxisGridLines />
						<Graph.YAxisAnnotations
							offsetY={2}
							offsetX={-4}
							style={{ fontSize: 6 }}
						/>
						<Graph.AreaFillXAxis
							coordinateOverride={speedgraphData.roadSpeeds}
						/>
						<Graph.VerticalLineBars />
						<Graph.ScrubberLeftToRight
							currentDataPointIndex={currentDataPoint}
							setCurrentDataPointIndex={setCurrentDataPoint}
						/>
					</Graph.Canvas>
				</Graph>
			</section>
			<section style={{ gridRow: "3 / 5" }}>
				<Graph
					xAxisValues={speedgraphData.pointSpeeds}
					xAxisMin={0}
					xAxisMax={Math.max(...speedgraphData.pointSpeeds)}
					xAxisSize={200}
					xAxisStep={10}
					yAxisScale={4}
				>
					<Graph.Canvas padding={{ top: 20, right: 10, bottom: 10, left: 10 }}>
						<Graph.XAxisGridLines />
						<Graph.XAxisAnnotations
							offsetY={4}
							offsetX={-4}
							style={{ fontSize: 6 }}
							position="top"
						/>
						<Graph.InvertedHorizontalLineBars />
						<Graph.ScrubberTopToBottom
							currentDataPointIndex={currentDataPoint}
							setCurrentDataPointIndex={setCurrentDataPoint}
						/>
					</Graph.Canvas>
				</Graph>
			</section>
			<section></section>
			<section></section>
		</main>
	);
};

ReactDOM.render(<App />, document.getElementById("root"));
