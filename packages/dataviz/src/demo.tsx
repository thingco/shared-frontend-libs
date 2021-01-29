import React from "react";
import ReactDOM from "react-dom";

import { Gauge } from "./Gauge";
import { Graph } from "./Graph";

const App = () => {
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
					<Graph.YAxisGridLines />
					<Graph.XAxisGridLines />
					<Graph.YAxis />
					<Graph.XAxis />
					<Graph.YAxisAnnotations offsetY={1} offsetX={-4} />
					<Graph.XAxisAnnotations offsetY={-6} />
					<Graph.DataLine />
					<Graph.DataDots />
					{/* <Graph.DataHorizontalLineBar /> */}
				</Graph>
			</section>
			<section>
				<Gauge value={75} strokeWidth={4} />
			</section>
		</main>
	);
};

ReactDOM.render(<App />, document.getElementById("root"));
