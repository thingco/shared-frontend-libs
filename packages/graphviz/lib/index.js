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
    // NOTE REGARDING TYPECASTING: All branches have been covered to populate values,
    // they cannot be undefined at this point, compiler is being overstrict:
    return {
        xAxisMax,
        xAxisMin,
        xAxisScale: xAxisScale,
        xAxisSize: xAxisSize,
        xAxisStep,
        xAxisValues: xAxisValues,
        yAxisMax,
        yAxisMin,
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
const px = projectXCoordToSVG;
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
const py = projectYCoordToSVG;
function verticalLineFullHeight(graph, xPosition) {
    return {
        x1: px(graph, xPosition),
        x2: px(graph, xPosition),
        y1: 0,
        y2: graph.yAxisSize,
    };
}
function horizontalLineFullWidth(graph, yPosition) {
    return {
        x1: 0,
        x2: graph.xAxisSize,
        y1: py(graph, yPosition),
        y2: py(graph, yPosition),
    };
}
function yAxis(graph) {
    const xPlacement = graph.xAxisMin > 0 ? graph.xAxisMin : 0;
    return verticalLineFullHeight(graph, xPlacement);
}
function yAxisAnnotations(graph) {
    const xPlacement = graph.xAxisMin > 0 ? graph.xAxisMin : 0;
    return steppedYAxisValues(graph).map((v) => ({
        x: px(graph, xPlacement),
        y: py(graph, v),
    }));
}
function horizontalGridLines(graph) {
    return steppedYAxisValues(graph).map((v) => horizontalLineFullWidth(graph, v));
}
function yAxisSteps(graph) {
    return steppedYAxisValues(graph).map((v) => ({
        x1: px(graph, 0),
        x2: px(graph, 0) - 2,
        y1: py(graph, v),
        y2: py(graph, v),
    }));
}
function xAxis(graph, position = "bottom") {
    return horizontalLineFullWidth(graph, position === "top" ? graph.yAxisMax : 0);
}
function xAxisSteps(graph, position) {
    return steppedXAxisValues(graph).map((v) => ({
        x1: px(graph, v),
        x2: px(graph, v),
        y1: position === "top" ? py(graph, graph.yAxisMax) : py(graph, 0),
        y2: position === "top" ? py(graph, graph.yAxisMax) - 2 : py(graph, 0) + 2,
    }));
}
function xAxisAnnotations(graph, position = "bottom") {
    return steppedXAxisValues(graph).map((v) => ({
        x: px(graph, v),
        y: py(graph, position === "top" ? graph.yAxisMax : 0),
    }));
}
function verticalGridlines(graph) {
    return steppedXAxisValues(graph).map((v) => verticalLineFullHeight(graph, v));
}
function dotPoints(graph) {
    return graph.yAxisValues.map((v, i) => ({
        x: px(graph, graph.xAxisValues[i]),
        y: py(graph, v),
    }));
}
function linePoints(graph) {
    return graph.yAxisValues
        .map((v, i) => `${px(graph, graph.xAxisValues[i])},${py(graph, v)}`)
        .join(" ");
}
function horizontalLineBarPoints(graph) {
    return graph.xAxisValues.map((v, i) => ({
        x1: px(graph, 0),
        x2: px(graph, v),
        y1: py(graph, graph.yAxisValues[i]),
        y2: py(graph, graph.yAxisValues[i]),
    }));
}
function verticalLineBarPoints(graph) {
    return graph.yAxisValues.map((v, i) => ({
        x1: px(graph, graph.xAxisValues[i]),
        x2: px(graph, graph.xAxisValues[i]),
        y1: py(graph, 0),
        y2: py(graph, v),
    }));
}

export { calculateScale, calculateSize, createGraph, dotPoints, horizontalGridLines, horizontalLineBarPoints, horizontalLineFullWidth, linePoints, projectXCoordToSVG, projectYCoordToSVG, px, py, steppedXAxisValues, steppedYAxisValues, verticalGridlines, verticalLineBarPoints, verticalLineFullHeight, xAxis, xAxisAnnotations, xAxisSteps, yAxis, yAxisAnnotations, yAxisSteps };
//# sourceMappingURL=index.js.map
