import React from "react";
export interface ScrubberControlProps {
    currentDataPointIndex: number;
    setCurrentDataPointIndex: (n: number) => void;
    thumbStyle?: React.CSSProperties;
}
export declare const ScrubberLeftToRight: ({ thumbStyle, currentDataPointIndex, setCurrentDataPointIndex, }: ScrubberControlProps) => JSX.Element;
export declare const ScrubberTopToBottom: ({ thumbStyle, currentDataPointIndex, setCurrentDataPointIndex, }: ScrubberControlProps) => JSX.Element;
//# sourceMappingURL=Scrubber.d.ts.map