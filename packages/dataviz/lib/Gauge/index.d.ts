import React from "react";
export interface GaugeProps {
    value: number;
    strokeWidth?: number;
    style?: React.CSSProperties;
    colourMapper?: (value: number) => string;
}
export declare function defaultColourMapper(value: number): string;
export declare const Gauge: ({ colourMapper, strokeWidth, style, value, }: GaugeProps) => JSX.Element;
//# sourceMappingURL=index.d.ts.map