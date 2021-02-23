import { VerticalAlignment } from "@thingco/graphviz";
import React from "react";
export interface AxisProps {
    style?: React.CSSProperties;
    showSteps?: boolean;
}
export declare const XAxis: ({ style, showSteps, position, }: AxisProps & {
    position?: "top" | "zero" | "bottom" | undefined;
}) => JSX.Element;
export declare const YAxis: ({ style, showSteps, }: AxisProps) => JSX.Element;
//# sourceMappingURL=Axes.d.ts.map