import React from "react";

import { useGraph } from "./Context";
import { xAxisGridlines, yAxisGridLines } from "./projections";

export interface GridLinesProps {
  style?: React.CSSProperties;
}

const defaultGridLinesStyle: React.CSSProperties = {
  stroke: "grey",
  vectorEffect: "non-scaling-stroke",
  opacity: "0.5",
};

export const XAxisGridLines = ({
  style = defaultGridLinesStyle,
}: GridLinesProps): JSX.Element => {
  const graph = useGraph();

  return (
    <g data-componentid="x-axis-gridlines">
      {xAxisGridlines(graph).map(({ x1, x2, y1, y2 }, i) => (
        <line
          key={`${x1}${x2}${y1}${y2}${i}`}
          x1={x1}
          x2={x2}
          y1={y1}
          y2={y2}
          style={style}
          data-componentid={`x-axis-gridline-${x1}${x2}${y1}${y2}${i}`}
        />
      ))}
    </g>
  );
};

export const YAxisGridLines = ({
  style = defaultGridLinesStyle,
}: GridLinesProps): JSX.Element => {
  const graph = useGraph();

  return (
    <g data-componentid="y-axis-gridlines">
      {yAxisGridLines(graph).map(({ x1, x2, y1, y2 }, i) => (
        <line
          key={`${x1}${x2}${y1}${y2}${i}`}
          x1={x1}
          x2={x2}
          y1={y1}
          y2={y2}
          style={style}
          data-componentid={`y-axis-gridline-${x1}${x2}${y1}${y2}${i}`}
        />
      ))}
    </g>
  );
};
