import { GraphConstructor } from "@thingco/graphviz";
import React from "react";
export declare type GraphProps = GraphConstructor & {
    children: React.ReactNode;
};
export declare const Graph: {
    ({ children, xAxisSize, xAxisScale, xAxisMax, xAxisMin, xAxisStep, xAxisValues, yAxisSize, yAxisScale, yAxisMax, yAxisMin, yAxisStep, yAxisValues, }: GraphProps): JSX.Element;
    Canvas: ({ children, padding, preserveAspectRatio, style, }: import("./Canvas").CanvasProps) => JSX.Element;
    XAxisAnnotations: ({ style, annotations, offsetY, position, }: import("./Annotations").AxisAnnotationsProps & {
        position?: "top" | "zero" | "bottom" | undefined;
    }) => JSX.Element;
    YAxisAnnotations: ({ style, offsetX, offsetY, annotations, }: import("./Annotations").AxisAnnotationsProps) => JSX.Element;
    DataLine: ({ style }: import("./Data").DataProps) => JSX.Element;
    DataDots: ({ style, r, }: import("./Data").DataProps & {
        r?: number | undefined;
    }) => JSX.Element;
    VerticalLineBars: ({ style }: import("./Data").DataProps) => JSX.Element;
    HorizontalLineBars: ({ style }: import("./Data").DataProps) => JSX.Element;
    AreaFillXAxis: ({ style, coordinateOverride, }: import("./Data").DataProps) => JSX.Element;
    AreaFillYAxis: ({ style, coordinateOverride, }: import("./Data").DataProps) => JSX.Element;
    XAxis: ({ style, showSteps, position, }: import("./Axes").AxisProps & {
        position?: "top" | "zero" | "bottom" | undefined;
    }) => JSX.Element;
    XAxisGridLines: ({ style }: import("./GridLines").GridLinesProps) => JSX.Element;
    YAxis: ({ style, showSteps, }: import("./Axes").AxisProps) => JSX.Element;
    YAxisGridLines: ({ style }: import("./GridLines").GridLinesProps) => JSX.Element;
    ScrubberHorizontal: ({ thumbStyle, currentDataPointIndex, setCurrentDataPointIndex, startPosition, }: import("./Scrubber").ScrubberControlProps & {
        startPosition: import("@thingco/graphviz").HorizontalAlignment;
    }) => JSX.Element;
    ScrubberVertical: ({ thumbStyle, currentDataPointIndex, setCurrentDataPointIndex, startPosition, }: import("./Scrubber").ScrubberControlProps & {
        startPosition: import("@thingco/graphviz").VerticalAlignment;
    }) => JSX.Element;
};
export { useGraph } from "./Context";
//# sourceMappingURL=Graph.d.ts.map