import { GraphData } from "../create-graph";
export interface LineCoordinate {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
}
export interface PointCoordinate {
    x: number;
    y: number;
}
export declare type VerticalAlignment = "top" | "zero" | "bottom";
export declare type HorizontalAlignment = "left" | "zero" | "right";
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
export declare const px: typeof projectXCoordToSVG;
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
export declare const py: typeof projectYCoordToSVG;
export declare function verticalLineFullHeight(graph: GraphData, xPosition: number): LineCoordinate;
export declare function horizontalLineFullWidth(graph: GraphData, yPosition: number): LineCoordinate;
export declare function yAxis(graph: GraphData): LineCoordinate;
export declare function yAxisAnnotations(graph: GraphData): PointCoordinate[];
export declare function horizontalGridLines(graph: GraphData): LineCoordinate[];
export declare function yAxisSteps(graph: GraphData): LineCoordinate[];
export declare function xAxis(graph: GraphData, position?: string): LineCoordinate;
export declare function xAxisSteps(graph: GraphData, position: VerticalAlignment): LineCoordinate[];
export declare function xAxisAnnotations(graph: GraphData, position?: string): PointCoordinate[];
export declare function verticalGridlines(graph: GraphData): LineCoordinate[];
export declare function dotPoints(graph: GraphData): PointCoordinate[];
export declare function linePoints(graph: GraphData): string;
export declare function horizontalLineBarPoints(graph: GraphData): LineCoordinate[];
export declare function verticalLineBarPoints(graph: GraphData): LineCoordinate[];
//# sourceMappingURL=svg.d.ts.map