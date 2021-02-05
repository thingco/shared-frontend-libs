import React from "react";
export interface DataProps {
    style?: React.CSSProperties;
    coordinateOverride?: number[];
}
export declare const DataLine: ({ style }: DataProps) => JSX.Element;
export declare const VerticalLineBars: ({ style }: DataProps) => JSX.Element;
export declare const HorizontalLineBars: ({ style }: DataProps) => JSX.Element;
export declare const InvertedHorizontalLineBars: ({ style, }: DataProps) => JSX.Element;
export declare const DataDots: ({ style, r, }: DataProps & {
    r?: number | undefined;
}) => JSX.Element;
export declare const AreaFillXAxis: ({ style, coordinateOverride, }: DataProps) => JSX.Element;
export declare const AreaFillYAxis: ({ style, coordinateOverride, }: DataProps) => JSX.Element;
//# sourceMappingURL=Data.d.ts.map