import { memo } from "react";

import { styled } from "../config";

// NOTE need to coerce the variants, and the following are required to match
// the types from the "csstypes" package used by stitches:
type StrokeLinecapProperty = "butt" | "round" | "square";
type StrokeLinejoinProperty = "bevel" | "miter" | "round";

const strokeVariants = {
	weight: {
		"2": { strokeWidth: "2" },
		"4": { strokeWidth: "4" },
	},
	linecap: {
		butt: { strokeLinecap: "butt" as StrokeLinecapProperty },
		round: { strokeLinecap: "round" as StrokeLinecapProperty },
		square: { strokeLinecap: "square" as StrokeLinecapProperty },
	},
	linejoin: {
		bevel: { strokeLinejoin: "bevel" as StrokeLinejoinProperty },
		miter: { strokeLinejoin: "miter" as StrokeLinejoinProperty },
		round: { strokeLinejoin: "round" as StrokeLinejoinProperty },
	},
};

const strokeDefaults: {
	weight: "2" | "4";
	linecap: StrokeLinecapProperty;
	linejoin: StrokeLinejoinProperty;
} = {
	weight: "4",
	linecap: "round",
	linejoin: "round",
};

const LineIconElSvg = styled("svg", {
	display: "block",
	pointerEvents: "none",
	height: "100%",
	width: "100%",
});

const LineIconElTitle = styled("title", {});

const LineIconElBaseWrapper = styled("g", {
	fill: "none",
	stroke: "currentColor",
	vectorEffect: "none",
	variants: {
		strokeScaling: {
			constrained: {
				vectorEffect: "non-scaling-stroke",
			},
		},
	},
});

const LineIconElG = styled("g", {
	variants: { ...strokeVariants },
	defaultVariants: { ...strokeDefaults },
});

const LineIconElCircle = styled("circle", {
	variants: { ...strokeVariants },
	defaultVariants: { ...strokeDefaults },
});

const LineIconElEllipse = styled("ellipse", {
	variants: { ...strokeVariants },
	defaultVariants: { ...strokeDefaults },
});
const LineIconElLine = styled("line", {
	variants: { ...strokeVariants },
	defaultVariants: { ...strokeDefaults },
});
const LineIconElPath = styled("path", {
	variants: { ...strokeVariants },
	defaultVariants: { ...strokeDefaults },
});
const LineIconElPolygon = styled("polygon", {
	variants: { ...strokeVariants },
	defaultVariants: { ...strokeDefaults },
});
const LineIconElPolyline = styled("polyline", {
	variants: { ...strokeVariants },
	defaultVariants: { ...strokeDefaults },
});
const LineIconElRect = styled("rect", {
	variants: { ...strokeVariants },
	defaultVariants: { ...strokeDefaults },
});

export interface LineIconProps {
	title: string;
	// strokeScaling?: "constrained";
}

export const LineIconArrowDown = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M44 38 32 50 20 38" />
			<LineIconElPath d="M32 50 32 14" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconArrowLeft = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M26 44 14 32 26 20" />
			<LineIconElPath d="M14 32 50 32" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconArrowRight = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M38 20 50 32 38 44" />
			<LineIconElPath d="M50 32 14 32" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconArrowUp = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M20 26 32 14 44 26" />
			<LineIconElPath d="M32 14 32 50" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconClock = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElCircle cx="32" cy="32" r="22" />
			<LineIconElG weight="2">
				<LineIconElCircle cx="32" cy="32" r=".85" />
				<LineIconElPath d="M32 18.46V32M40.79 37.08 32 32" />
				<LineIconElPath d="M32 15.08 32 10" />
				<LineIconElPath d="M32 54 32 48.92" />
				<LineIconElPath d="M48.92 32 54 32" />
				<LineIconElPath d="M10 32 15.08 32" />
				<LineIconElPath d="M40.46 17.34 43 12.95" />
				<LineIconElPath d="M21 51.05 23.54 46.66" />
				<LineIconElPath d="M46.66 40.46 51.05 43" />
				<LineIconElPath d="M12.95 21 17.34 23.54" />
				<LineIconElPath d="M46.66 23.54 51.05 21" />
				<LineIconElPath d="M12.95 43 17.34 40.46" />
				<LineIconElPath d="M40.46 46.66 43 51.05" />
				<LineIconElPath d="M21 12.95 23.54 17.34" />
			</LineIconElG>
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconContractVertical = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M42.08 50.04 32 39.96 21.92 50.04" />
			<LineIconElPath d="M21.92 13.96 32 24.04 42.08 13.96" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconDial = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElG weight="2">
				<LineIconElCircle cx="32" cy="37.5" r=".85" />
				<LineIconElPath d="M43.72 30.73 32 37.5" />
				<LineIconElPath d="M32 20.58 32 15.5" />
				<LineIconElG>
					<LineIconElPath d="M48.92 37.5 54 37.5" />
					<LineIconElPath d="M10 37.5 15.08 37.5" />
				</LineIconElG>
				<LineIconElPath d="M40.46 22.84 43 18.45" />
				<LineIconElPath d="M12.95 26.5 17.34 29.04" />
				<LineIconElPath d="M46.66 29.04 51.05 26.5" />
				<LineIconElPath d="M21 18.45 23.54 22.84" />
			</LineIconElG>
			<LineIconElPath d="m46.66 46 4.39 2.54a22 22 0 1 0-41-11A21.83 21.83 0 0 0 13 48.5l4.34-2.5" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconDirectionDown = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M50 23 32 41 14 23" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconDirectionLeft = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M41 14 23 32 41 50" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconDirectionRight = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M23 14 41 32 23 50" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconDirectionUp = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M50 41 32 23 14 41" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconDownload = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M50 38v8a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4v-8" />
			<LineIconElPath d="M41 27 32 36 23 27" />
			<LineIconElPath d="M32 35.5 32 11.5" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconEditCancel = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M22 50 14 42" />
			<LineIconElPath d="M52 20 44 12" />
			<LineIconElPath d="M6 10 54 58" />
			<LineIconElPath d="M34.69 12.34H57.31999999999999V23.65H34.69z" />
			<LineIconElPath d="M26 30 14 42 10 54 22 50 34 38 26 30z" />
			<LineIconElPath weight="2" d="M22 50 14 42" />
			<LineIconElPath d="M52 20 44 12" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconEdit = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M48 8 56 16 20 52 8 56 12 44 48 8z" />
			<LineIconElPath weight="2" d="M20 52 12 44" />
			<LineIconElPath d="M50 22 42 14" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconExclamation = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M32 35.5 32 13.5" />
			<LineIconElCircle cx="32" cy="47.5" r="3" />
			<LineIconElCircle cx="32" cy="47.5" r="2" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconExpandVertical = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M21.92 43.96 32 54.04 42.08 43.96" />
			<LineIconElPath d="M42.08 20.04 32 9.96 21.92 20.04" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconGraphBar = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElG>
				<LineIconElPath d="M24 38 24 50" />
				<LineIconElPath d="M16 42 16 50" />
				<LineIconElPath d="M32 30 32 50" />
				<LineIconElPath d="M40 18 40 50" />
				<LineIconElPath d="M48 26 48 50" />
			</LineIconElG>
			<LineIconElG weight="2">
				<LineIconElPath d="M9 13 9 51" />
				<LineIconElPath d="M9 51 55 51" />
			</LineIconElG>
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconGraphLine = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElG weight="2">
				<LineIconElPath d="M9 13 9 51" />
				<LineIconElPath d="M9 51 55 51" />
			</LineIconElG>
			<LineIconElPath d="M16 42 24 38 32 30 40 18 48 27.29" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconGraphPie = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElG weight="2">
				<LineIconElPath d="M35.72 14.39 32 18.12" />
				<LineIconElPath d="M39.23 15.51 32 22.75" />
				<LineIconElPath d="M42.19 17.17 32 27.37" />
				<LineIconElPath d="M44.72 19.28 32 32" />
				<LineIconElPath d="M46.83 21.81 36.63 32" />
				<LineIconElPath d="M48.49 24.77 41.25 32" />
				<LineIconElPath d="M49.61 28.28 45.88 32" />
			</LineIconElG>
			<LineIconElG>
				<LineIconElPath d="M50 32a18 18 0 1 1-18-18v18z" />
				<LineIconElPath d="M50 32H32V14a18 18 0 0 1 18 18z" />
			</LineIconElG>
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconGridDot = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElCircle cx="32" cy="16" r="2" />
			<LineIconElCircle cx="48" cy="16" r="2" />
			<LineIconElCircle cx="48" cy="32" r="2" />
			<LineIconElCircle cx="32" cy="32" r="2" />
			<LineIconElCircle cx="16" cy="32" r="2" />
			<LineIconElCircle cx="48" cy="48" r="2" />
			<LineIconElCircle cx="32" cy="48" r="2" />
			<LineIconElCircle cx="16" cy="48" r="2" />
			<LineIconElCircle cx="16" cy="16" r="2" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconGridHeavy = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M16 10 16 54" />
			<LineIconElPath d="M32 10 32 54" />
			<LineIconElPath d="M48 10 48 54" />
			<LineIconElPath d="M10 48 54 48" />
			<LineIconElPath d="M10 32 54 32" />
			<LineIconElPath d="M10 16 54 16" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconGridHorizontalHeavy = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M10 47.99 54 47.99" />
			<LineIconElPath d="M10 31.99 54 31.99" />
			<LineIconElPath d="M10 15.99 54 15.99" />
			<LineIconElPath d="M16.01 10 16.01 54" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconGridHorizontalLight = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M10 47.99 54 47.99" />
			<LineIconElPath d="M10 31.99 54 31.99" />
			<LineIconElPath d="M10 23.99 54 23.99" />
			<LineIconElPath d="M10 39.99 54 39.99" />
			<LineIconElPath d="M10 15.99 54 15.99" />
			<LineIconElPath d="M16.01 10 16.01 54" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconGridLight = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M16 10 16 54" />
			<LineIconElPath d="M24 10 24 54" />
			<LineIconElPath d="M40 10 40 54" />
			<LineIconElPath d="M32 10 32 54" />
			<LineIconElPath d="M48 10 48 54" />
			<LineIconElPath d="M10 48 54 48" />
			<LineIconElPath d="M10 32 54 32" />
			<LineIconElPath d="M10 24 54 24" />
			<LineIconElPath d="M10 40 54 40" />
			<LineIconElPath d="M10 16 54 16" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconGridVerticalHeavy = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M15.99 10 15.99 54" />
			<LineIconElPath d="M31.99 10 31.99 54" />
			<LineIconElPath d="M47.99 10 47.99 54" />
			<LineIconElPath d="M10 16.01 54 16.01" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconGridVerticalLight = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M16 10 16 54" />
			<LineIconElPath d="M32 10 32 54" />
			<LineIconElPath d="M40 10 40 54" />
			<LineIconElPath d="M24 10 24 54" />
			<LineIconElPath d="M48 10 48 54" />
			<LineIconElPath d="M10 16 54 16" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconInformation = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElCircle cx="32" cy="17" r="2" />
			<LineIconElPath d="M32 51 32 29" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconMagnifyingGlass = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElCircle cx="27.56" cy="27.56" r="15.56" />
			<LineIconElPath d="M39.78 39.78 52 52" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconMinus = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M14 32 50 32" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconPin = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M54 27.51a22 22 0 1 0-36 17l14 14 14-14a22 22 0 0 0 8-17z" />
			<LineIconElCircle cx="32" cy="27.51" r="15" weight="2" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconPlus = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M16 32 48 32" />
			<LineIconElPath d="M32 16 32 48" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconQuestion = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M32 37.5c0-6 10-6 10-14a10 10 0 1 0-20 0" />
			<LineIconElCircle cx="32" cy="47.5" r="3" />
			<LineIconElCircle cx="32" cy="47.5" r="2" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconSettings = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M16 44 16 52" />
			<LineIconElPath d="M32 28 32 36" />
			<LineIconElPath d="M48 12 48 20" />
			<LineIconElPath d="M22 48 56 48" />
			<LineIconElPath d="M8 32 26 32" />
			<LineIconElPath d="M8 48 14 48" />
			<LineIconElPath d="M34 32 56 32" />
			<LineIconElPath d="M8 16 42 16" />
			<LineIconElPath d="M50 16 56 16" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconStar = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M34.39 9.81a2.48 2.48 0 0 0-4.78 0L25.1 24.33H10.51a2.53 2.53 0 0 0-2.39 1.81A2.72 2.72 0 0 0 9 29.08l11.8 9-4.47 14.48a2.71 2.71 0 0 0 .91 2.94 2.42 2.42 0 0 0 3 0l11.81-9 11.81 9a2.42 2.42 0 0 0 2.95 0 2.71 2.71 0 0 0 .91-2.94l-4.56-14.51 11.8-9a2.72 2.72 0 0 0 .92-2.94 2.53 2.53 0 0 0-2.39-1.81H38.9z" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconTick = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M50 20 26 44 14 32" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconUpload = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M50 38v8a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4v-8" />
			<LineIconElPath d="M23 22.5 32 13.5 41 22.5" />
			<LineIconElPath d="M32 14 32 38" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

type LineIconType =
	| "ArrowDown"
	| "ArrowLeft"
	| "ArrowRight"
	| "ArrowUp"
	| "Clock"
	| "ContractVertical"
	| "Dial"
	| "DirectionDown"
	| "DirectionLeft"
	| "DirectionRight"
	| "DirectionUp"
	| "Download"
	| "EditCancel"
	| "Edit"
	| "Exclamation"
	| "ExpandVertical"
	| "GraphBar"
	| "GraphLine"
	| "GraphPie"
	| "GridDot"
	| "GridHeavy"
	| "GridHorizontalHeavy"
	| "GridHorizontalLight"
	| "GridLight"
	| "GridVerticalHeavy"
	| "GridVerticalLight"
	| "Information"
	| "MagnifyingGlass"
	| "Minus"
	| "Pin"
	| "Plus"
	| "Question"
	| "Settings"
	| "Star"
	| "Tick"
	| "Upload";

export const LineIcon = memo(
	({ icontype, ...props }: { icontype: LineIconType } & LineIconProps): JSX.Element => {
		switch (icontype) {
			case "ArrowDown":
				return <LineIconArrowDown {...props} />;
			case "ArrowLeft":
				return <LineIconArrowLeft {...props} />;
			case "ArrowRight":
				return <LineIconArrowRight {...props} />;
			case "ArrowUp":
				return <LineIconArrowUp {...props} />;
			case "Clock":
				return <LineIconClock {...props} />;
			case "ContractVertical":
				return <LineIconContractVertical {...props} />;
			case "Dial":
				return <LineIconDial {...props} />;
			case "DirectionDown":
				return <LineIconDirectionDown {...props} />;
			case "DirectionLeft":
				return <LineIconDirectionLeft {...props} />;
			case "DirectionRight":
				return <LineIconDirectionRight {...props} />;
			case "DirectionUp":
				return <LineIconDirectionUp {...props} />;
			case "Download":
				return <LineIconDownload {...props} />;
			case "EditCancel":
				return <LineIconEditCancel {...props} />;
			case "Edit":
				return <LineIconEdit {...props} />;
			case "Exclamation":
				return <LineIconExclamation {...props} />;
			case "ExpandVertical":
				return <LineIconExpandVertical {...props} />;
			case "GraphBar":
				return <LineIconGraphBar {...props} />;
			case "GraphLine":
				return <LineIconGraphLine {...props} />;
			case "GraphPie":
				return <LineIconGraphPie {...props} />;
			case "GridDot":
				return <LineIconGridDot {...props} />;
			case "GridHeavy":
				return <LineIconGridHeavy {...props} />;
			case "GridHorizontalHeavy":
				return <LineIconGridHorizontalHeavy {...props} />;
			case "GridHorizontalLight":
				return <LineIconGridHorizontalLight {...props} />;
			case "GridLight":
				return <LineIconGridLight {...props} />;
			case "GridVerticalHeavy":
				return <LineIconGridVerticalHeavy {...props} />;
			case "GridVerticalLight":
				return <LineIconGridVerticalLight {...props} />;
			case "Information":
				return <LineIconInformation {...props} />;
			case "MagnifyingGlass":
				return <LineIconMagnifyingGlass {...props} />;
			case "Minus":
				return <LineIconMinus {...props} />;
			case "Pin":
				return <LineIconPin {...props} />;
			case "Plus":
				return <LineIconPlus {...props} />;
			case "Question":
				return <LineIconQuestion {...props} />;
			case "Settings":
				return <LineIconSettings {...props} />;
			case "Star":
				return <LineIconStar {...props} />;
			case "Tick":
				return <LineIconTick {...props} />;
			case "Upload":
				return <LineIconUpload {...props} />;
			default:
				return <p>INVALID ICON TYPE: {icontype}</p>;
		}
	}
);
