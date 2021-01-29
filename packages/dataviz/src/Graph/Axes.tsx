import React from "react";

import { useGraph } from "./Context";
import { xAxis, xAxisSteps, yAxis, yAxisSteps } from "./projections";

export interface AxisProps {
  style?: React.CSSProperties;
  showSteps?: boolean;
}

const defaultAxisStyle: React.CSSProperties = {
  fill: "none",
  stroke: "black",
  strokeLinecap: "round",
  strokeWidth: 1,
};

export const XAxis = ({
  style = defaultAxisStyle,
  showSteps = true,
}: AxisProps): JSX.Element => {
  const graph = useGraph();
  const { x1, x2, y1, y2 } = xAxis(graph);
  const axisSteps = showSteps ? xAxisSteps(graph) : null;

  return (
    <g data-componentid="x-axis">
      <line style={style} x1={x1} x2={x2} y1={y1} y2={y2} />
      {axisSteps?.map(({ x1, x2, y1, y2 }, i) => (
        <line
          key={`${x1}${x2}${y1}${y2}${i}`}
          style={style}
          x1={x1}
          x2={x2}
          y1={y1}
          y2={y2}
        />
      ))}
    </g>
  );
};

export const YAxis = ({
  style = defaultAxisStyle,
  showSteps = true,
}: AxisProps): JSX.Element => {
  const graph = useGraph();
  const { x1, x2, y1, y2 } = yAxis(graph);
  const axisSteps = showSteps ? yAxisSteps(graph) : null;

  return (
    <g data-componentid="y-axis">
      <line style={style} x1={x1} x2={x2} y1={y1} y2={y2} />
      {axisSteps?.map(({ x1, x2, y1, y2 }, i) => (
        <line
          key={`${x1}${x2}${y1}${y2}${i}`}
          style={style}
          x1={x1}
          x2={x2}
          y1={y1}
          y2={y2}
        />
      ))}
    </g>
  );
};
