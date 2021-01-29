export interface GraphConstructor {
    yAxisSize: number;
    yMax?: number;
    yMin?: number;
    yStep?: number;
    yValues: number[];
    xAxisSize: number;
    xMax?: number;
    xMin?: number;
    xStep?: number;
    xValues?: number[];
}
export declare class GraphData {
    /** The array of data to be plotted on the y axis. */
    yAxisValues: number[];
    /**
     * The defined length of the y axis, as in a literal [unitless, but is pixels]
     * value for length.
     */
    yAxisSize: number;
    /**
     * The MINIMUM value to be used on the y axis. By default, this will be zero, but it is
     * necessary to keep it configurable to allow for data that includes negative values.
     */
    yAxisMin: number;
    /**
     * The MAXIMUM value to be used on the y axis. By default this will be the maximum of the
     * y axis values, but it is necessary to keep it configurable to allow for spacing at
     * extremities of this graph axis.
     */
    yAxisMax: number;
    /**
     * The scaling factor for the y axis. Used to project coordinates onto the rendered graph.
     */
    yAxisScale: number;
    /**
     * The step used to generate positions for annotations and grid lines on the y axis.
     */
    yAxisStep: number;
    /**
     * The array of data to be plotted on the x axis. For a horizontal series graph, this
     * will be just the indices of the yAxisValues data.
     */
    xAxisValues: number[];
    /**
     * The defined length of the x axis, as in a literal [unitless, but is pixels]
     * value for length.
     */
    xAxisSize: number;
    /**
     * The MINIMUM value to be used on the x axis. By default, this will be zero, but it is
     * necessary to keep it configurable to allow for data that includes negative values.
     */
    xAxisMin: number;
    /**
     * The MAXIMUM value to be used on the x axis. By default this will be the maximum of the
     * x axis values, but it is necessary to keep it configurable to allow for spacing at
     * extremities of this graph axis.
     */
    xAxisMax: number;
    /**
     * The scaling factor for the x axis. Used to project coordinates onto the rendered graph.
     */
    xAxisScale: number;
    /**
     * The step used to generate positions for annotations and grid lines on the x axis.
     */
    xAxisStep: number;
    constructor({ yValues, yMax, yMin, xMin, xMax, xValues, yAxisSize, xAxisSize, xStep, yStep, }: GraphConstructor);
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
export declare function calculateScale(axisSize: number, axisMin: number, axisMax: number): number;
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
export declare function projectXCoordToSVG({ xAxisMin, xAxisScale }: GraphData, axisCoord: number): number;
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
export declare function projectYCoordToSVG({ yAxisMin, yAxisScale, yAxisSize }: GraphData, axisCoord: number): number;
/**
 * Generate an array of x axis coordinates for stepped points along that axis. Used to place annotations.
 *
 * @param {GraphData} graphData
 * @param {number} graphData.xAxisMin
 * @param {number} graphData.xAxisMax
 * @param {number} graphData.xAxisStep
 * @returns {number[]}
 */
export declare function steppedXAxisValues({ xAxisMin, xAxisMax, xAxisStep }: GraphData): number[];
/**
 * Generate an array of y axis coordinates for stepped points along that axis. Used to place annotations.
 *
 * @param {GraphData} graphData
 * @param {number} graphData.yAxisMin
 * @param {number} graphData.yAxisMax
 * @param {number} graphData.yAxisStep
 * @returns {number[]}
 */
export declare function steppedYAxisValues({ yAxisMin, yAxisMax, yAxisStep }: GraphData): number[];
//# sourceMappingURL=graph.d.ts.map