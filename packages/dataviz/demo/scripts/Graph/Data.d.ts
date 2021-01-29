import React from "react";
import { GraphData } from "./setup";
export interface DataLineProps {
    style?: React.CSSProperties;
}
export declare function projectedDataLinePoints(graph: GraphData): string;
export declare const DataLine: ({ style }: DataLineProps) => JSX.Element;
export declare function projectedHorizontalLineBarPoints(graph: GraphData): {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
}[];
export declare const DataHorizontalLineBar: ({ style, }: DataLineProps) => JSX.Element;
export interface DataDotsProps {
    style?: React.CSSProperties;
    r?: number;
}
export declare function projectedDotsPoints(graph: GraphData): {
    x: number;
    y: number;
}[];
export declare const DataDots: ({ style, r }: DataDotsProps) => JSX.Element;
//# sourceMappingURL=Data.d.ts.map