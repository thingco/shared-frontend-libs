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

function createGraph({ xAxisMax, xAxisMin = 0, xAxisSize, xAxisScale, xAxisStep = 1, xAxisValues, yAxisMax, yAxisMin = 0, yAxisSize, yAxisScale, yAxisStep = 1, yAxisValues, }) {
    /**
     * If neither the x and y axis values are provided, cannot create the graph:
     */
    if (!xAxisValues && !yAxisValues) {
        throw new Error("ONE OR BOTH x- or y-axis value arrays MUST be provided to create the graph.");
    }
    /**
     * If only one of the x/y axis values are provided, the other axis can be assumed
     * to be the length of the other (_ie_ the values are plotted on a range/in series):
     */
    if (yAxisValues && !xAxisValues) {
        xAxisValues = Array.from({ length: yAxisValues.length }, (_, i) => i + xAxisMin);
    }
    else if (xAxisValues && !yAxisValues) {
        yAxisValues = Array.from({ length: xAxisValues.length }, (_, i) => i + yAxisMin);
    }
    // Once both of the arrays of values are populated, can infer the max values if not present:
    xAxisMax = xAxisMax ?? Math.max(...xAxisValues);
    yAxisMax = yAxisMax ?? Math.max(...yAxisValues);
    /**
     * If the x-axis size is *not* provided, then the scale *must* be
     * provided, otherwise the size of the axis cannot be calculated:
     */
    if ((!xAxisSize && !xAxisScale) || (xAxisSize && xAxisScale)) {
        throw new Error("EITHER the x-axis size OR the x-axis scale must be provided up-front or this graph axis cannot be plotted.");
    }
    else if (xAxisSize && !xAxisScale) {
        xAxisScale = calculateScale(xAxisSize, xAxisMin, xAxisMax);
    }
    else if (!xAxisSize && xAxisScale) {
        xAxisSize = calculateSize(xAxisScale, xAxisMin, xAxisMax);
    }
    /**
     * If the y-axis size is *not* provided, then the scale *must* be
     * provided, otherwise the size of the axis cannot be calculated:
     */
    if ((!yAxisSize && !yAxisScale) || (yAxisSize && yAxisScale)) {
        throw new Error("EITHER the y-axis size OR the y-axis scale must be provided up-front or this graph axis cannot be plotted.");
    }
    else if (yAxisSize && !yAxisScale) {
        yAxisScale = calculateScale(yAxisSize, yAxisMin, yAxisMax);
    }
    else if (!yAxisSize && yAxisScale) {
        yAxisSize = calculateSize(yAxisScale, yAxisMin, yAxisMax);
    }
    return {
        xAxisMax,
        xAxisMin,
        // All branches have been covered to populate following two values,
        // they cannot be undefined at this point, compiler is being overstrict:
        xAxisScale: xAxisScale,
        xAxisSize: xAxisSize,
        xAxisStep,
        xAxisValues: xAxisValues,
        yAxisMax,
        yAxisMin,
        // All branches have been covered to populate following two values,
        // they cannot be undefined at this point, compiler is being overstrict:
        yAxisScale: yAxisScale,
        yAxisSize: yAxisSize,
        yAxisStep,
        yAxisValues: yAxisValues,
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
 *
 * scale 10 min 0 max 10 size 100
 * scale 10 min -50 max 50 size 100
 * scale 10 min -25 max 75 size 100
 * scale 10 min -100 max 0 size 100
 *
 * @param {number} axisScale
 * @param {number} axisMin
 * @param {number} axisMax
 * @returns {number}
 */
function calculateSize(axisScale, axisMin, axisMax) {
    return (axisMax - axisMin) * axisScale;
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
 * NOTE specific, limited use.
 *
 * As `projectXCoordToSVG`, which will result in an inverted graph,
 * 0 at top, max at bottom. The only usecase for this is a graph
 * that has an axis rendered top to bottom vertically.
 *
 * @param {GraphData} graphData
 * @param {number} graphData.yAxisMin
 * @param {number} graphData.yAxisScale
 * @param {number} axisCoord
 * @returns {number}
 */
function projectInvertedYCoordToSVG({ yAxisMin, yAxisScale }, axisCoord) {
    return (axisCoord - yAxisMin) * yAxisScale;
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

function verticalLineFullHeight(graph, xPosition) {
    return {
        x1: projectXCoordToSVG(graph, xPosition),
        x2: projectXCoordToSVG(graph, xPosition),
        y1: 0,
        y2: graph.yAxisSize,
    };
}
function horizontalLineFullWidth(graph, yPosition) {
    return {
        x1: 0,
        x2: graph.xAxisSize,
        y1: projectYCoordToSVG(graph, yPosition),
        y2: projectYCoordToSVG(graph, yPosition),
    };
}
function invertedHorizontalLineFullWidth(graph, yPosition) {
    return {
        x1: 0,
        x2: graph.xAxisSize,
        y1: projectInvertedYCoordToSVG(graph, yPosition),
        y2: projectInvertedYCoordToSVG(graph, yPosition),
    };
}
function yAxis(graph) {
    const xPlacement = graph.xAxisMin > 0 ? graph.xAxisMin : 0;
    return verticalLineFullHeight(graph, xPlacement);
}
function yAxisAnnotations(graph) {
    const xPlacement = graph.xAxisMin > 0 ? graph.xAxisMin : 0;
    return steppedYAxisValues(graph).map((v) => ({
        x: projectXCoordToSVG(graph, xPlacement),
        y: projectYCoordToSVG(graph, v),
    }));
}
function horizontalGridLines(graph) {
    return steppedYAxisValues(graph).map((v) => horizontalLineFullWidth(graph, v));
}
function yAxisSteps(graph) {
    return steppedYAxisValues(graph).map((v) => ({
        x1: projectXCoordToSVG(graph, 0),
        x2: projectXCoordToSVG(graph, 0) - 2,
        y1: projectYCoordToSVG(graph, v),
        y2: projectYCoordToSVG(graph, v),
    }));
}
function xAxis(graph, position = "bottom") {
    return horizontalLineFullWidth(graph, position === "top" ? graph.yAxisMax : 0);
}
function xAxisSteps(graph, position) {
    return steppedXAxisValues(graph).map((v) => ({
        x1: projectXCoordToSVG(graph, v),
        x2: projectXCoordToSVG(graph, v),
        y1: position === "top" ? projectYCoordToSVG(graph, graph.yAxisMax) : projectYCoordToSVG(graph, 0),
        y2: position === "top" ? projectYCoordToSVG(graph, graph.yAxisMax) - 2 : projectYCoordToSVG(graph, 0) + 2,
    }));
}
function xAxisAnnotations(graph, position = "bottom") {
    return steppedXAxisValues(graph).map((v) => ({
        x: projectXCoordToSVG(graph, v),
        y: projectYCoordToSVG(graph, position === "top" ? graph.yAxisMax : 0),
    }));
}
function verticalGridlines(graph) {
    return steppedXAxisValues(graph).map((v) => verticalLineFullHeight(graph, v));
}
function dotPoints(graph) {
    return graph.yAxisValues.map((v, i) => ({
        x: projectXCoordToSVG(graph, graph.xAxisValues[i]),
        y: projectYCoordToSVG(graph, v),
    }));
}
function linePoints(graph) {
    return graph.yAxisValues
        .map((v, i) => `${projectXCoordToSVG(graph, graph.xAxisValues[i])},${projectYCoordToSVG(graph, v)}`)
        .join(" ");
}
function horizontalLineBarPoints(graph) {
    return graph.xAxisValues.map((v, i) => ({
        x1: projectXCoordToSVG(graph, 0),
        x2: projectXCoordToSVG(graph, v),
        y1: projectYCoordToSVG(graph, graph.yAxisValues[i]),
        y2: projectYCoordToSVG(graph, graph.yAxisValues[i]),
    }));
}
function invertedHorizontalLineBarPoints(graph) {
    return graph.xAxisValues.map((v, i) => ({
        x1: projectXCoordToSVG(graph, 0),
        x2: projectXCoordToSVG(graph, v),
        y1: projectInvertedYCoordToSVG(graph, graph.yAxisValues[i]),
        y2: projectInvertedYCoordToSVG(graph, graph.yAxisValues[i]),
    }));
}
function verticalLineBarPoints(graph) {
    return graph.yAxisValues.map((v, i) => ({
        x1: projectXCoordToSVG(graph, graph.xAxisValues[i]),
        x2: projectXCoordToSVG(graph, graph.xAxisValues[i]),
        y1: projectYCoordToSVG(graph, 0),
        y2: projectYCoordToSVG(graph, v),
    }));
}

const defaultAnnotationStyle = {
    fontSize: 3,
    fontFamily: "sans-serif",
    fontWeight: "bold",
    textAnchor: "middle",
};
const XAxisAnnotations = ({ style = {}, annotations, offsetY = 4, position = "bottom", }) => {
    style = { ...defaultAnnotationStyle, ...style };
    const graph = useGraph();
    annotations = annotations ?? steppedXAxisValues(graph);
    return (React.createElement("g", { style: style, "data-componentid": "x-axis-annotations" }, xAxisAnnotations(graph, position).map(({ x, y }, i) => (React.createElement("text", { key: `${x}${y}${i}`, x: x, y: y - offsetY, "data-componentid": `x-axis-annotation-${x}${y}${i}` }, annotations && annotations[i])))));
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
const XAxis = ({ style = defaultAxisStyle, showSteps = true, position = "bottom", }) => {
    const graph = useGraph();
    const { x1, x2, y1, y2 } = xAxis(graph, position);
    const axisSteps = showSteps ? xAxisSteps(graph, position) : null;
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

const Canvas = ({ children, padding = 10, style = {}, }) => {
    const graph = useGraph();
    const viewBoxMinX = 0 - (typeof padding === "number" ? padding : padding.left);
    const viewBoxMinY = 0 - (typeof padding === "number" ? padding : padding.top);
    const viewBoxWidth = graph.xAxisSize +
        (typeof padding === "number" ? padding * 2 : padding.right + padding.left);
    const viewBoxHeight = graph.yAxisSize +
        (typeof padding === "number" ? padding * 2 : padding.top + padding.bottom);
    return (React.createElement("svg", { style: style, viewBox: `${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`, width: "100%", height: "100%" }, children));
};

const defaultDataLineStyle = {
    fill: "none",
    stroke: "black",
    strokeLinecap: "round",
    strokeWidth: 1,
};
const DataLine = ({ style = {} }) => {
    style = { ...defaultDataLineStyle, ...style };
    const graph = useGraph();
    return React.createElement("polyline", { style: style, points: linePoints(graph) });
};
const VerticalLineBars = ({ style = {} }) => {
    style = { ...defaultDataLineStyle, ...style };
    const graph = useGraph();
    const lines = verticalLineBarPoints(graph).map(({ x1, x2, y1, y2 }, i) => (React.createElement("line", { key: `${x1}${x2}${y1}${y2}${i}`, x1: x1, x2: x2, y1: y1, y2: y2 })));
    return React.createElement("g", { style: style }, lines);
};
const HorizontalLineBars = ({ style = {} }) => {
    style = { ...defaultDataLineStyle, ...style };
    const graph = useGraph();
    const lines = horizontalLineBarPoints(graph).map(({ x1, x2, y1, y2 }, i) => (React.createElement("line", { key: `${x1}${x2}${y1}${y2}${i}`, x1: x1, x2: x2, y1: y1, y2: y2 })));
    return React.createElement("g", { style: style }, lines);
};
const InvertedHorizontalLineBars = ({ style = {}, }) => {
    style = { ...defaultDataLineStyle, ...style };
    const graph = useGraph();
    const lines = invertedHorizontalLineBarPoints(graph).map(({ x1, x2, y1, y2 }, i) => (React.createElement("line", { key: `${x1}${x2}${y1}${y2}${i}`, x1: x1, x2: x2, y1: y1, y2: y2 })));
    return React.createElement("g", { style: style }, lines);
};
const defaultDataDotsStyle = {
    fill: "black",
    stroke: "white",
    strokeWidth: 1,
};
const DataDots = ({ style = {}, r = 2, }) => {
    style = { ...defaultDataDotsStyle, ...style };
    const graph = useGraph();
    const dots = dotPoints(graph).map(({ x, y }, i) => (React.createElement("circle", { key: `${x}${y}${i}`, cx: x, cy: y, r: r })));
    return React.createElement("g", { style: style }, dots);
};
const defaultAreaStyle = {
    stroke: "none",
    fill: "grey",
    opacity: 0.2,
};
const AreaFillXAxis = ({ style = {}, coordinateOverride, }) => {
    style = { ...defaultAreaStyle, ...style };
    let graph = useGraph();
    // If using as an overlay, there will be a new set of y-axis coordinates to plot:
    if (coordinateOverride) {
        graph = { ...graph, yAxisValues: coordinateOverride };
    }
    const points = `${projectXCoordToSVG(graph, 0)},${projectYCoordToSVG(graph, 0)} ${linePoints(graph)} ${projectXCoordToSVG(graph, graph.xAxisMax)},${projectYCoordToSVG(graph, 0)}`;
    return React.createElement("polygon", { style: style, points: points });
};
const AreaFillYAxis = ({ style = {}, coordinateOverride, }) => {
    style = { ...defaultAreaStyle, ...style };
    let graph = useGraph();
    // If using as an overlay, there will be a new set of y-axis coordinates to plot:
    if (coordinateOverride) {
        graph = { ...graph, xAxisValues: coordinateOverride };
    }
    const points = `${projectXCoordToSVG(graph, 0)},${projectYCoordToSVG(graph, 0)} ${linePoints(graph)} ${projectXCoordToSVG(graph, 0)},${projectYCoordToSVG(graph, graph.yAxisMax)}`;
    return React.createElement("polygon", { style: style, points: points });
};

const defaultGridLinesStyle = {
    stroke: "grey",
    vectorEffect: "non-scaling-stroke",
    opacity: "0.5",
};
const XAxisGridLines = ({ style = defaultGridLinesStyle, }) => {
    const graph = useGraph();
    return (React.createElement("g", { "data-componentid": "x-axis-gridlines" }, verticalGridlines(graph).map(({ x1, x2, y1, y2 }, i) => (React.createElement("line", { key: `${x1}${x2}${y1}${y2}${i}`, x1: x1, x2: x2, y1: y1, y2: y2, style: style, "data-componentid": `x-axis-gridline-${x1}${x2}${y1}${y2}${i}` })))));
};
const YAxisGridLines = ({ style = defaultGridLinesStyle, }) => {
    const graph = useGraph();
    return (React.createElement("g", { "data-componentid": "y-axis-gridlines" }, horizontalGridLines(graph).map(({ x1, x2, y1, y2 }, i) => (React.createElement("line", { key: `${x1}${x2}${y1}${y2}${i}`, x1: x1, x2: x2, y1: y1, y2: y2, style: style, "data-componentid": `y-axis-gridline-${x1}${x2}${y1}${y2}${i}` })))));
};

const underlyingRangeInputStyle = {
    appearance: "none",
    background: "transparent",
    opacity: 0,
    display: "block",
    width: "100%",
    height: "100%",
};
const underlyingVerticalRangeInputStyle = {
    ...underlyingRangeInputStyle,
    WebkitAppearance: "slider-vertical",
    transform: "rotate(180deg)",
};
const defaultRangeStyle = {
    fill: "none",
    stroke: "black",
    strokeWidth: 2,
};
const ScrubberLeftToRight = ({ thumbStyle = {}, currentDataPointIndex, setCurrentDataPointIndex, }) => {
    thumbStyle = { ...defaultRangeStyle, ...thumbStyle };
    const graph = useGraph();
    const { x1, x2, y1, y2 } = verticalLineFullHeight(graph, 0);
    return (React.createElement(React.Fragment, null,
        React.createElement("g", { transform: `translate(${projectXCoordToSVG(graph, graph.xAxisValues[currentDataPointIndex])})` },
            React.createElement("line", { style: thumbStyle, x1: x1, x2: x2, y1: y1, y2: y2 })),
        React.createElement("foreignObject", { x: 0, y: 0, width: graph.xAxisSize, height: graph.yAxisSize, "data-componentid": "scrubbercontrol" },
            React.createElement("input", { onChange: (e) => setCurrentDataPointIndex(+e.target.value), type: "range", min: 0, max: graph.yAxisValues.length, step: 1, style: underlyingRangeInputStyle, value: currentDataPointIndex }))));
};
const ScrubberTopToBottom = ({ thumbStyle = {}, currentDataPointIndex, setCurrentDataPointIndex, }) => {
    thumbStyle = { ...defaultRangeStyle, ...thumbStyle };
    const graph = useGraph();
    const { x1, x2, y1, y2 } = invertedHorizontalLineFullWidth(graph, 0);
    /** NOTE TS typings for input elements do not include the `orient` property */
    const inputRef = React.useRef(null);
    React.useEffect(() => {
        if (inputRef != null && inputRef.current != null) {
            inputRef.current.setAttribute("orient", "vertical");
        }
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement("g", { transform: `translate(0 ${projectInvertedYCoordToSVG(graph, graph.yAxisValues[currentDataPointIndex])})` },
            React.createElement("line", { style: thumbStyle, x1: x1, x2: x2, y1: y1, y2: y2 })),
        React.createElement("foreignObject", { x: 0, y: 0, width: graph.xAxisSize, height: graph.yAxisSize, "data-componentid": "scrubbercontrol" },
            React.createElement("input", { ref: inputRef, onChange: (e) => setCurrentDataPointIndex(+e.target.value), type: "range", min: 0, max: graph.yAxisValues.length, step: 1, style: underlyingVerticalRangeInputStyle, value: currentDataPointIndex }))));
};

const Graph = ({ children, xAxisSize, xAxisScale, xAxisMax, xAxisMin, xAxisStep, xAxisValues, yAxisSize, yAxisScale, yAxisMax, yAxisMin, yAxisStep, yAxisValues, }) => {
    const graph = createGraph({
        xAxisSize,
        xAxisScale,
        xAxisMax,
        xAxisMin,
        xAxisStep,
        xAxisValues,
        yAxisSize,
        yAxisScale,
        yAxisMax,
        yAxisMin,
        yAxisStep,
        yAxisValues,
    });
    return (React.createElement(GraphContext.Provider, { value: graph }, children));
};
Graph.Canvas = Canvas;
Graph.XAxisAnnotations = XAxisAnnotations;
Graph.YAxisAnnotations = YAxisAnnotations;
Graph.DataLine = DataLine;
Graph.DataDots = DataDots;
Graph.VerticalLineBars = VerticalLineBars;
Graph.HorizontalLineBars = HorizontalLineBars;
Graph.InvertedHorizontalLineBars = InvertedHorizontalLineBars;
Graph.AreaFillXAxis = AreaFillXAxis;
Graph.AreaFillYAxis = AreaFillYAxis;
Graph.XAxis = XAxis;
Graph.XAxisGridLines = XAxisGridLines;
Graph.YAxis = YAxis;
Graph.YAxisGridLines = YAxisGridLines;
Graph.ScrubberLeftToRight = ScrubberLeftToRight;
Graph.ScrubberTopToBottom = ScrubberTopToBottom;

export { Gauge, Graph, defaultColourMapper };
//# sourceMappingURL=index.js.map
