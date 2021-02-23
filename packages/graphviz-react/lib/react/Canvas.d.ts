import React from "react";
export declare type GraphPadding = number | {
    top: number;
    right: number;
    bottom: number;
    left: number;
};
export interface CanvasProps {
    children: React.ReactNode;
    padding?: GraphPadding;
    preserveAspectRatio?: string;
    style?: React.CSSProperties;
}
export declare const Canvas: ({ children, padding, preserveAspectRatio, style, }: CanvasProps) => JSX.Element;
//# sourceMappingURL=Canvas.d.ts.map