import React from 'react';

function defaultColourMapper(value) {
    switch (true) {
        case value === 0:
            return "grey";
        default:
            return "black";
    }
}
// arc length = circumference * (fraction of circle represented by the arc)
const arcLength = 2 * Math.PI * 28 * (270 / 360);
function getIndicatorLength(value) {
    return arcLength * (1 - value / 100);
}
const Gauge = ({ colourMapper = defaultColourMapper, strokeWidth = 4, style = {}, value, }) => {
    const indicatorLength = getIndicatorLength(value);
    const pad = strokeWidth - 4;
    const d = `M -${20 - pad} ${20 - pad} A ${28 - pad} ${28 - pad}, 0, 1, 1, ${20 - pad} ${20 - pad}`;
    return (React.createElement("svg", { viewBox: "-32 -32 64 64", width: "100%", height: "100%", style: style },
        React.createElement("g", { fill: "none", strokeWidth: strokeWidth, strokeLinecap: "round" },
            React.createElement("path", { d: d, stroke: colourMapper(0) }),
            React.createElement("path", { d: d, stroke: colourMapper(value), strokeDasharray: arcLength, strokeDashoffset: indicatorLength }))));
};

/**
 * NOTE the context is defined apart from the Provider to prevent circular dependencies
 * occuring when main `Series.tsx` file was broken down into separate discrete files.
 */
const GraphContext = React.createContext(null);
function useGraph() {
    const graph = React.useContext(GraphContext);
    if (!GraphContext) {
        throw new Error("Series values can only be accessed from within a series context provider.");
    }
    else if (!graph) {
        throw new Error("Series provider value is null: cannot access anything from it, please configure it correctly.");
    }
    return graph;
}

function createGraph({ xAxisMax, xAxisMin = 0, xAxisSize, xAxisStep = 1, xAxisValues, yAxisMax, yAxisMin = 0, yAxisSize, yAxisStep = 1, yAxisValues, }) {
    if (!(xAxisSize && yAxisSize)) {
        throw new Error("BOTH the x- and y-axis size MUST be provided to create the graph.");
    }
    if (!(xAxisValues && yAxisValues)) {
        throw new Error("ONE OR BOTH x- or y-axis value arrays MUST be provided to create the graph.");
    }
    if (!xAxisValues) {
        xAxisValues = Array.from({ length: yAxisValues.length }, (_, i) => i + xAxisMin);
    }
    if (!yAxisValues) {
        yAxisValues = Array.from({ length: xAxisValues.length }, (_, i) => i + yAxisMin);
    }
    xAxisMax = xAxisMax ?? Math.max(...xAxisValues);
    yAxisMax = yAxisMax ?? Math.max(...yAxisValues);
    const xAxisScale = calculateScale(xAxisSize, xAxisMin, xAxisMax);
    const yAxisScale = calculateScale(yAxisSize, yAxisMin, yAxisMax);
    return {
        xAxisMax,
        xAxisMin,
        xAxisScale,
        xAxisSize,
        xAxisStep,
        xAxisValues,
        yAxisMax,
        yAxisMin,
        yAxisScale,
        yAxisSize,
        yAxisStep,
        yAxisValues,
    };
}
/**
 * Examples:
 *
 * size 100 min 0 max 10 scale 10
 * size 100 min -50 max 50 scale 10
 * size 100 min -25 max 75 scale 10
 * size 100 min -100 max 0 scale 10
 *
 * @param {number} axisSize
 * @param {number} axisMin
 * @param {number} axisMax
 * @returns {number}
 */
function calculateScale(axisSize, axisMin, axisMax) {
    return axisSize / (axisMax - axisMin);
}
/**
 * Examples:
 * coord at 5, size 100, min 0, max 10, scale 10 = 50
 * coord at 5, size 100, min -5, max 5, scale 10 = 100
 * coord at 5, size 100, min -2.5, max 7.5, scale 10 = 75
 * coord at -5, size 100, min -10, max 0, scale 10 = 50
 *
 * If the axis min value is greater than zero, then floor it to zero
 * in the calculation: the graph is plotted on the SVG from a zero
 * point regardless of what the data is.
 *
 * coord at 0, size 100, min 1, max 10, scale 11.1 = 0
 *
 * REVIEW if there are only negative values, there may be an issue here, TEST.
 *
 * @param {GraphData} graphData
 * @param {number} graphData.xAxisMin
 * @param {number} graphData.xAxisScale
 * @param {number} axisCoord
 * @returns {number}
 */
function projectXCoordToSVG({ xAxisMin, xAxisScale }, axisCoord) {
    return (axisCoord - xAxisMin) * xAxisScale;
}
/**
 * As `projectXCoordToSVG`, except that the resulting coordinate is inverted based on the y axis
 * size. This is because SVG coordinates are plotted from the top left, not the bottom left.
 * Leaving the coordinates as-is would cause the graph to be flipped vertically.
 *
 * Examples:
 * coord at 5, size 100, min 0, max 10, scale 10 = 100 - 50 = 50
 * coord at 5, size 100, min -5, max 5, scale 10 = 100 - 100 = 0
 * coord at 5, size 100, min -2.5, max 7.5, scale 10 = 100 - 75 = 25
 * coord at -5, size 100, min -10, max 0, scale 10 = 100 - 50 = 50
 *
 * @param {GraphData} graphData
 * @param {number} graphData.yAxisMin
 * @param {number} graphData.yAxisScale
 * @param {number} graphData.yAxisSize
 * @param {number} axisCoord
 * @returns {number}
 */
function projectYCoordToSVG({ yAxisMin, yAxisScale, yAxisSize }, axisCoord) {
    return yAxisSize - (axisCoord - yAxisMin) * yAxisScale;
}
/**
 * Generate an array of x axis coordinates for stepped points along that axis. Used to place annotations.
 *
 * @param {GraphData} graphData
 * @param {number} graphData.xAxisMin
 * @param {number} graphData.xAxisMax
 * @param {number} graphData.xAxisStep
 * @returns {number[]}
 */
function steppedXAxisValues({ xAxisMin, xAxisMax, xAxisStep, }) {
    const vals = [];
    // TODO currently ignoring graphs that only have data with negative values that should be plotted
    // starting on a value < 0.
    if (xAxisMin > 0) {
        for (let v = xAxisMin; v <= xAxisMax; v += xAxisStep)
            vals.push(v);
        return vals;
    }
    else {
        vals.push(0);
        for (let v = 0 - xAxisStep; v >= xAxisMin; v -= xAxisStep)
            vals.unshift(v);
        for (let v = 0 + xAxisStep; v <= xAxisMax; v += xAxisStep)
            vals.push(v);
        return vals;
    }
}
/**
 * Generate an array of y axis coordinates for stepped points along that axis. Used to place annotations.
 *
 * @param {GraphData} graphData
 * @param {number} graphData.yAxisMin
 * @param {number} graphData.yAxisMax
 * @param {number} graphData.yAxisStep
 * @returns {number[]}
 */
function steppedYAxisValues({ yAxisMin, yAxisMax, yAxisStep, }) {
    const vals = [];
    // TODO currently ignoring graphs that only have data with negative values that should be plotted
    // starting on a value < 0.
    if (yAxisMin > 0) {
        for (let v = yAxisMin; v <= yAxisMax; v += yAxisStep)
            vals.push(v);
        return vals;
    }
    else {
        vals.push(0);
        for (let v = 0 - yAxisStep; v >= yAxisMin; v -= yAxisStep)
            vals.unshift(v);
        for (let v = 0 + yAxisStep; v <= yAxisMax; v += yAxisStep)
            vals.push(v);
        return vals;
    }
}

function yAxis(graph) {
    const xPlacement = graph.xAxisMin > 0 ? graph.xAxisMin : 0;
    return {
        x1: projectXCoordToSVG(graph, xPlacement),
        x2: projectXCoordToSVG(graph, xPlacement),
        y1: 0,
        y2: graph.yAxisSize,
    };
}
function yAxisAnnotations(graph) {
    const xPlacement = graph.xAxisMin > 0 ? graph.xAxisMin : 0;
    return steppedYAxisValues(graph).map((v) => ({
        x: projectXCoordToSVG(graph, xPlacement),
        y: projectYCoordToSVG(graph, v),
    }));
}
function yAxisGridLines(graph) {
    return steppedYAxisValues(graph).map((v) => ({
        x1: 0,
        x2: graph.xAxisSize,
        y1: projectYCoordToSVG(graph, v),
        y2: projectYCoordToSVG(graph, v),
    }));
}
function yAxisSteps(graph) {
    return steppedYAxisValues(graph).map((v) => ({
        x1: projectXCoordToSVG(graph, 0),
        x2: projectXCoordToSVG(graph, 0) - 2,
        y1: projectYCoordToSVG(graph, v),
        y2: projectYCoordToSVG(graph, v),
    }));
}
function xAxis(graph) {
    return { x1: 0, x2: graph.xAxisSize, y1: projectYCoordToSVG(graph, 0), y2: projectYCoordToSVG(graph, 0) };
}
function xAxisAnnotations(graph) {
    return steppedXAxisValues(graph).map((v) => ({
        x: projectXCoordToSVG(graph, v),
        y: projectYCoordToSVG(graph, 0),
    }));
}
function xAxisGridlines(graph) {
    return steppedXAxisValues(graph).map((v) => ({
        x1: projectXCoordToSVG(graph, v),
        x2: projectXCoordToSVG(graph, v),
        y1: 0,
        y2: graph.yAxisSize,
    }));
}
function xAxisSteps(graph) {
    return steppedXAxisValues(graph).map((v) => ({
        x1: projectXCoordToSVG(graph, v),
        x2: projectXCoordToSVG(graph, v),
        y1: projectYCoordToSVG(graph, 0),
        y2: projectYCoordToSVG(graph, 0) + 2,
    }));
}

const defaultAnnotationStyle = {
    fontSize: 3,
    fontFamily: "sans-serif",
    fontWeight: "bold",
    textAnchor: "middle",
};
const XAxisAnnotations = ({ style = {}, annotations, offsetY = 4, }) => {
    style = { ...defaultAnnotationStyle, ...style };
    const graph = useGraph();
    annotations = annotations ?? steppedXAxisValues(graph);
    return (React.createElement("g", { style: style, "data-componentid": "x-axis-annotations" }, xAxisAnnotations(graph).map(({ x, y }, i) => (React.createElement("text", { key: `${x}${y}${i}`, x: x, y: y - offsetY, "data-componentid": `x-axis-annotation-${x}${y}${i}` }, annotations && annotations[i])))));
};
const YAxisAnnotations = ({ style = {}, offsetX = 2, offsetY = 0, annotations, }) => {
    style = { ...defaultAnnotationStyle, ...style };
    const graph = useGraph();
    annotations = annotations ?? steppedYAxisValues(graph);
    return (React.createElement("g", { "data-componentid": "y-axis-annotations" }, yAxisAnnotations(graph).map(({ x, y }, i) => (React.createElement("text", { key: `${x}${y}${i}`, x: x + offsetX, y: y, dy: offsetY, style: { ...style, textAnchor: "end" }, "data-componentid": `y-axis-annotation-${x}${y}${i}` }, annotations && annotations[i])))));
};

const defaultAxisStyle = {
    fill: "none",
    stroke: "black",
    strokeLinecap: "round",
    strokeWidth: 1,
};
const XAxis = ({ style = defaultAxisStyle, showSteps = true, }) => {
    const graph = useGraph();
    const { x1, x2, y1, y2 } = xAxis(graph);
    const axisSteps = showSteps ? xAxisSteps(graph) : null;
    return (React.createElement("g", { "data-componentid": "x-axis" },
        React.createElement("line", { style: style, x1: x1, x2: x2, y1: y1, y2: y2 }),
        axisSteps?.map(({ x1, x2, y1, y2 }, i) => (React.createElement("line", { key: `${x1}${x2}${y1}${y2}${i}`, style: style, x1: x1, x2: x2, y1: y1, y2: y2 })))));
};
const YAxis = ({ style = defaultAxisStyle, showSteps = true, }) => {
    const graph = useGraph();
    const { x1, x2, y1, y2 } = yAxis(graph);
    const axisSteps = showSteps ? yAxisSteps(graph) : null;
    return (React.createElement("g", { "data-componentid": "y-axis" },
        React.createElement("line", { style: style, x1: x1, x2: x2, y1: y1, y2: y2 }),
        axisSteps?.map(({ x1, x2, y1, y2 }, i) => (React.createElement("line", { key: `${x1}${x2}${y1}${y2}${i}`, style: style, x1: x1, x2: x2, y1: y1, y2: y2 })))));
};

const defaultDataLineStyle = {
    fill: "none",
    stroke: "black",
    strokeLinecap: "round",
    strokeWidth: 1,
};
function projectedDataLinePoints(graph) {
    return graph.yAxisValues
        .map((v, i) => `${projectXCoordToSVG(graph, graph.xAxisValues[i])},${projectYCoordToSVG(graph, v)}`)
        .join(" ");
}
const DataLine = ({ style = {} }) => {
    style = { ...defaultDataLineStyle, ...style };
    const graph = useGraph();
    return React.createElement("polyline", { style: style, points: projectedDataLinePoints(graph) });
};
function projectedHorizontalLineBarPoints(graph) {
    return graph.yAxisValues.map((v, i) => ({
        x1: projectXCoordToSVG(graph, graph.xAxisValues[i]),
        x2: projectXCoordToSVG(graph, graph.xAxisValues[i]),
        y1: projectYCoordToSVG(graph, 0),
        y2: projectYCoordToSVG(graph, v),
    }));
}
const DataHorizontalLineBar = ({ style = {}, }) => {
    style = { ...defaultDataLineStyle, ...style };
    const graph = useGraph();
    const lines = projectedHorizontalLineBarPoints(graph).map(({ x1, x2, y1, y2 }, i) => (React.createElement("line", { key: `${x1}${x2}${y1}${y2}${i}`, x1: x1, x2: x2, y1: y1, y2: y2 })));
    return React.createElement("g", { style: style }, lines);
};
const defaultDataDotsStyle = {
    fill: "black",
    stroke: "white",
    strokeWidth: 1,
};
function projectedDotsPoints(graph) {
    return graph.yAxisValues.map((v, i) => ({
        x: projectXCoordToSVG(graph, graph.xAxisValues[i]),
        y: projectYCoordToSVG(graph, v),
    }));
}
const DataDots = ({ style = {}, r = 2 }) => {
    style = { ...defaultDataDotsStyle, ...style };
    const graph = useGraph();
    const dots = projectedDotsPoints(graph).map(({ x, y }, i) => (React.createElement("circle", { key: `${x}${y}${i}`, cx: x, cy: y, r: r })));
    return React.createElement("g", { style: style }, dots);
};

const defaultGridLinesStyle = {
    stroke: "grey",
    vectorEffect: "non-scaling-stroke",
    opacity: "0.5",
};
const XAxisGridLines = ({ style = defaultGridLinesStyle, }) => {
    const graph = useGraph();
    return (React.createElement("g", { "data-componentid": "x-axis-gridlines" }, xAxisGridlines(graph).map(({ x1, x2, y1, y2 }, i) => (React.createElement("line", { key: `${x1}${x2}${y1}${y2}${i}`, x1: x1, x2: x2, y1: y1, y2: y2, style: style, "data-componentid": `x-axis-gridline-${x1}${x2}${y1}${y2}${i}` })))));
};
const YAxisGridLines = ({ style = defaultGridLinesStyle, }) => {
    const graph = useGraph();
    return (React.createElement("g", { "data-componentid": "y-axis-gridlines" }, yAxisGridLines(graph).map(({ x1, x2, y1, y2 }, i) => (React.createElement("line", { key: `${x1}${x2}${y1}${y2}${i}`, x1: x1, x2: x2, y1: y1, y2: y2, style: style, "data-componentid": `y-axis-gridline-${x1}${x2}${y1}${y2}${i}` })))));
};

const Graph = ({ xAxisSize, xAxisMax, xAxisMin, xAxisStep, xAxisValues, yAxisSize, yAxisMax, yAxisMin, yAxisStep, yAxisValues, children, padding = 10, style, }) => {
    const graph = createGraph({
        xAxisSize,
        xAxisMax,
        xAxisMin,
        xAxisStep,
        xAxisValues,
        yAxisSize,
        yAxisMax,
        yAxisMin,
        yAxisStep,
        yAxisValues,
    });
    const viewBoxMinX = 0 - (typeof padding === "number" ? padding : padding.left);
    const viewBoxMinY = 0 - (typeof padding === "number" ? padding : padding.top);
    const viewBoxWidth = graph.xAxisSize +
        (typeof padding === "number" ? padding * 2 : padding.right + padding.left);
    const viewBoxHeight = graph.yAxisSize +
        (typeof padding === "number" ? padding * 2 : padding.top + padding.bottom);
    return (React.createElement(GraphContext.Provider, { value: graph },
        React.createElement("svg", { style: style, viewBox: `${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`, width: "100%", height: "100%" }, children)));
};
Graph.XAxisAnnotations = XAxisAnnotations;
Graph.YAxisAnnotations = YAxisAnnotations;
Graph.DataLine = DataLine;
Graph.DataDots = DataDots;
Graph.DataHorizontalLineBar = DataHorizontalLineBar;
Graph.XAxis = XAxis;
Graph.XAxisGridLines = XAxisGridLines;
Graph.YAxis = YAxis;
Graph.YAxisGridLines = YAxisGridLines;

export { Gauge, Graph, defaultColourMapper };
//# sourceMappingURL=index.js.map
