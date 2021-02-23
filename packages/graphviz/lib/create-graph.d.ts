export declare type GraphConstructor = Partial<GraphData>;
export interface GraphData {
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
}
export declare function createGraph({ xAxisMax, xAxisMin, xAxisSize, xAxisScale, xAxisStep, xAxisValues, yAxisMax, yAxisMin, yAxisSize, yAxisScale, yAxisStep, yAxisValues, }: GraphConstructor): GraphData;
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
export declare function calculateSize(axisScale: number, axisMin: number, axisMax: number): number;
/**
 * Generate an array of x axis coordinates for stepped points along that axis. Used to place annotations.
 *
 * @param {GraphData} graphData
 * @param {number} graphData.xAxisMin
 * @param {number} graphData.xAxisMax
 * @param {number} graphData.xAxisStep
 * @returns {number[]}
 */
export declare function steppedXAxisValues({ xAxisMin, xAxisMax, xAxisStep, }: GraphData): number[];
/**
 * Generate an array of y axis coordinates for stepped points along that axis. Used to place annotations.
 *
 * @param {GraphData} graphData
 * @param {number} graphData.yAxisMin
 * @param {number} graphData.yAxisMax
 * @param {number} graphData.yAxisStep
 * @returns {number[]}
 */
export declare function steppedYAxisValues({ yAxisMin, yAxisMax, yAxisStep, }: GraphData): number[];
//# sourceMappingURL=create-graph.d.ts.map