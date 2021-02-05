import React from "react";
import { GraphConstructor } from "./setup";
export declare type GraphProps = GraphConstructor & {
    children: React.ReactNode;
};
export declare const Graph: {
    ({ children, xAxisSize, xAxisScale, xAxisMax, xAxisMin, xAxisStep, xAxisValues, yAxisSize, yAxisScale, yAxisMax, yAxisMin, yAxisStep, yAxisValues, }: GraphProps): JSX.Element;
    Canvas: ({ children, padding, style, }: import("./Canvas").CanvasProps) => JSX.Element;
    XAxisAnnotations: ({ style, annotations, offsetY, position, }: import("./Annotations").AxisAnnotationsProps & {
        position?: "top" | "bottom" | undefined;
    }) => JSX.Element;
    YAxisAnnotations: ({ style, offsetX, offsetY, annotations, }: import("./Annotations").AxisAnnotationsProps) => JSX.Element;
    DataLine: ({ style }: import("./Data").DataProps) => JSX.Element;
    DataDots: ({ style, r, }: import("./Data").DataProps & {
        r?: number | undefined;
    }) => JSX.Element;
    VerticalLineBars: ({ style }: import("./Data").DataProps) => JSX.Element;
    HorizontalLineBars: ({ style }: import("./Data").DataProps) => JSX.Element;
    InvertedHorizontalLineBars: ({ style, }: import("./Data").DataProps) => JSX.Element;
    AreaFillXAxis: ({ style, coordinateOverride, }: import("./Data").DataProps) => JSX.Element;
    AreaFillYAxis: ({ style, coordinateOverride, }: import("./Data").DataProps) => JSX.Element;
    XAxis: ({ style, showSteps, position, }: import("./Axes").AxisProps & {
        position?: "top" | "bottom" | undefined;
    }) => JSX.Element;
    XAxisGridLines: ({ style, }: import("./GridLines").GridLinesProps) => JSX.Element;
    YAxis: ({ style, showSteps, }: import("./Axes").AxisProps) => JSX.Element;
    YAxisGridLines: ({ style, }: import("./GridLines").GridLinesProps) => JSX.Element;
    ScrubberLeftToRight: ({ thumbStyle, currentDataPointIndex, setCurrentDataPointIndex, }: import("./Scrubber").ScrubberControlProps) => JSX.Element;
    ScrubberTopToBottom: ({ thumbStyle, currentDataPointIndex, setCurrentDataPointIndex, }: import("./Scrubber").ScrubberControlProps) => JSX.Element;
};
//# sourceMappingURL=index.d.ts.map