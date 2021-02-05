import React from "react";
import { VerticalAlignment } from "./projections";
export interface AxisProps {
    style?: React.CSSProperties;
    showSteps?: boolean;
}
export declare const XAxis: ({ style, showSteps, position, }: AxisProps & {
    position?: "top" | "bottom" | undefined;
}) => JSX.Element;
export declare const YAxis: ({ style, showSteps, }: AxisProps) => JSX.Element;
//# sourceMappingURL=Axes.d.ts.map