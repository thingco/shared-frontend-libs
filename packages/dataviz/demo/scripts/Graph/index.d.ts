import React from "react";
import { GraphConstructor } from "./setup";
export declare type GraphPadding = number | {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
export declare type GraphProps = GraphConstructor & {
    children: React.ReactNode;
    padding?: GraphPadding;
    style?: React.CSSProperties;
};
export declare const Graph: {
    ({ xAxisSize, xAxisMax, xAxisMin, xAxisStep, xAxisValues, yAxisSize, yAxisMax, yAxisMin, yAxisStep, yAxisValues, children, padding, style, }: GraphProps): JSX.Element;
    XAxisAnnotations: ({ style, annotations, offsetY, }: import("./Annotations").AxisAnnotationsProps) => JSX.Element;
    YAxisAnnotations: ({ style, offsetX, offsetY, annotations, }: import("./Annotations").AxisAnnotationsProps) => JSX.Element;
    DataLine: ({ style }: import("./Data").DataLineProps) => JSX.Element;
    DataDots: ({ style, r }: import("./Data").DataDotsProps) => JSX.Element;
    DataHorizontalLineBar: ({ style, }: import("./Data").DataLineProps) => JSX.Element;
    XAxis: ({ style, showSteps, }: import("./Axes").AxisProps) => JSX.Element;
    XAxisGridLines: ({ style, }: import("./GridLines").GridLinesProps) => JSX.Element;
    YAxis: ({ style, showSteps, }: import("./Axes").AxisProps) => JSX.Element;
    YAxisGridLines: ({ style, }: import("./GridLines").GridLinesProps) => JSX.Element;
};
//# sourceMappingURL=index.d.ts.map