import { GraphData } from "./setup";
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
export declare type VerticalAlignment = "top" | "bottom";
export declare type HorizontalAlignment = "left" | "right";
export declare function verticalLineFullHeight(graph: GraphData, xPosition: number): LineCoordinate;
export declare function horizontalLineFullWidth(graph: GraphData, yPosition: number): LineCoordinate;
export declare function invertedHorizontalLineFullWidth(graph: GraphData, yPosition: number): LineCoordinate;
export declare function yAxis(graph: GraphData): LineCoordinate;
export declare function yAxisAnnotations(graph: GraphData): PointCoordinate[];
export declare function invertedYAxisAnnotations(graph: GraphData): PointCoordinate[];
export declare function horizontalGridLines(graph: GraphData): LineCoordinate[];
export declare function invertedHorizontalGridLines(graph: GraphData): LineCoordinate[];
export declare function yAxisSteps(graph: GraphData): LineCoordinate[];
export declare function invertedYAxisSteps(graph: GraphData): LineCoordinate[];
export declare function xAxis(graph: GraphData, position?: string): LineCoordinate;
export declare function xAxisSteps(graph: GraphData, position: VerticalAlignment): LineCoordinate[];
export declare function xAxisAnnotations(graph: GraphData, position?: string): PointCoordinate[];
export declare function verticalGridlines(graph: GraphData): LineCoordinate[];
export declare function dotPoints(graph: GraphData): PointCoordinate[];
export declare function linePoints(graph: GraphData): string;
export declare function horizontalLineBarPoints(graph: GraphData): LineCoordinate[];
export declare function invertedHorizontalLineBarPoints(graph: GraphData): LineCoordinate[];
export declare function verticalLineBarPoints(graph: GraphData): LineCoordinate[];
//# sourceMappingURL=projections.d.ts.map