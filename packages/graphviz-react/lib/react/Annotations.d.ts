import { VerticalAlignment } from "@thingco/graphviz";
import React from "react";
export interface AxisAnnotationsProps {
    style?: React.CSSProperties;
    offsetY?: number;
    offsetX?: number;
    annotations?: (string | number)[];
}
export declare const XAxisAnnotations: ({ style, annotations, offsetY, position, }: AxisAnnotationsProps & {
    position?: "top" | "zero" | "bottom" | undefined;
}) => JSX.Element;
export declare const YAxisAnnotations: ({ style, offsetX, offsetY, annotations, }: AxisAnnotationsProps) => JSX.Element;
//# sourceMappingURL=Annotations.d.ts.map