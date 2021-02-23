import { HorizontalAlignment, VerticalAlignment } from "@thingco/graphviz";
import React from "react";
export interface ScrubberControlProps {
    currentDataPointIndex: number;
    setCurrentDataPointIndex: (n: number) => void;
    thumbStyle?: React.CSSProperties;
}
export declare const ScrubberHorizontal: ({ thumbStyle, currentDataPointIndex, setCurrentDataPointIndex, startPosition, }: ScrubberControlProps & {
    startPosition: HorizontalAlignment;
}) => JSX.Element;
export declare const ScrubberVertical: ({ thumbStyle, currentDataPointIndex, setCurrentDataPointIndex, startPosition, }: ScrubberControlProps & {
    startPosition: VerticalAlignment;
}) => JSX.Element;
//# sourceMappingURL=Scrubber.d.ts.map