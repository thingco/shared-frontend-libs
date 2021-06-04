import { StitchesComponentWithAutoCompleteForJSXElements } from "@stitches/react";

import { styled } from "../config";

const Circle = styled("circle", {});
const Ellipse = styled("ellipse", {});
const G = styled("g", {});
const Line = styled("line", {});
const Path = styled("path", {});
const Polygon = styled("polygon", {});
const Polyline = styled("polyline", {});
const Rect = styled("rect", {});
const Svg = styled("svg", {});

interface LineIconProps {
	title: string;
	// strokeScaling?: "constrained";
}

const strokeVariants = {
	variants: {
		weight: {
			"2": { strokeWidth: 2 },
			"4": { strokeWidth: 4 },
		},
		linecap: {
			butt: { strokeLinecap: "butt" },
			round: { strokeLinecap: "round" },
			square: { strokeLinecap: "square" },
		},
		linejoin: {
			arcs: { strokeLineJoin: "arcs" },
			bevel: { strokeLineJoin: "bevel" },
			miter: { strokeLineJoin: "miter" },
			"miter-clip": { strokeLineJoin: "miter-clip" },
			round: { strokeLineJoin: "round" },
		},
	},
	defaultVariants: {
		weight: "4",
		linecap: "round",
		linejoin: "round",
	},
};

const LineIcon: Record<
	string,
	StitchesComponentWithAutoCompleteForJSXElements<string, typeof strokeVariants>
> = {};

LineIcon.Svg = styled(Svg, {
	display: "block",
	pointerEvents: "none",
});

LineIcon.BaseWrapper = styled(G, {
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

LineIcon.G = styled(G, {});

LineIcon.Circle = styled(Circle, { ...strokeVariants });
LineIcon.Ellipse = styled(Ellipse, { ...strokeVariants });
LineIcon.Line = styled(Line, { ...strokeVariants });
LineIcon.Path = styled(Path, { ...strokeVariants });
LineIcon.Polygon = styled(Polygon, { ...strokeVariants });
LineIcon.Polyline = styled(Polyline, { ...strokeVariants });
LineIcon.Rect = styled(Rect, { ...strokeVariants });

export const LineIconArrowDown = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M44 38 32 50 20 38" />
			<LineIcon.Path d="M32 50 32 14" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconArrowLeft = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M26 44 14 32 26 20" />
			<LineIcon.Path d="M14 32 50 32" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconArrowRight = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M38 20 50 32 38 44" />
			<LineIcon.Path d="M50 32 14 32" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconArrowUp = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M20 26 32 14 44 26" />
			<LineIcon.Path d="M32 14 32 50" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconClock = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper></LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconContractVertical = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M42.08 50.04 32 39.96 21.92 50.04" />
			<LineIcon.Path d="M21.92 13.96 32 24.04 42.08 13.96" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconDial = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			undefined
			<LineIcon.Path d="m46.66 46 4.39 2.54a22 22 0 1 0-41-11A21.83 21.83 0 0 0 13 48.5l4.34-2.5" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconDirectionDown = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M50 23 32 41 14 23" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconDirectionLeft = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M41 14 23 32 41 50" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconDirectionRight = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M23 14 41 32 23 50" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconDirectionUp = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M50 41 32 23 14 41" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconDownload = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M50 38v8a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4v-8" />
			<LineIcon.Path d="M41 27 32 36 23 27" />
			<LineIcon.Path d="M32 35.5 32 11.5" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconEditCancel = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M22 50 14 42" />
			<LineIcon.Path d="M52 20 44 12" />
			<LineIcon.Path d="M6 10 54 58" />
			<LineIcon.Path d="M34.69 12.34H57.31999999999999V23.65H34.69z" />
			<LineIcon.Path d="M26 30 14 42 10 54 22 50 34 38 26 30z" />
			<LineIcon.Path weight="2" d="M22 50 14 42" />
			<LineIcon.Path d="M52 20 44 12" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconEdit = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M48 8 56 16 20 52 8 56 12 44 48 8z" />
			<LineIcon.Path weight="2" d="M20 52 12 44" />
			<LineIcon.Path d="M50 22 42 14" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconExclamation = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M32 35.5 32 13.5" />
			<LineIcon.Circle cx="32" cy="47.5" r="3" />
			<LineIcon.Circle cx="32" cy="47.5" r="2" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconExpandVertical = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M21.92 43.96 32 54.04 42.08 43.96" />
			<LineIcon.Path d="M42.08 20.04 32 9.96 21.92 20.04" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconGraphBar = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper></LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconGraphLine = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			undefined
			<LineIcon.Path d="M16 42 24 38 32 30 40 18 48 27.29" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconGraphPie = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper></LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconGridDot = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Circle cx="32" cy="16" r="2" />
			<LineIcon.Circle cx="48" cy="16" r="2" />
			<LineIcon.Circle cx="48" cy="32" r="2" />
			<LineIcon.Circle cx="32" cy="32" r="2" />
			<LineIcon.Circle cx="16" cy="32" r="2" />
			<LineIcon.Circle cx="48" cy="48" r="2" />
			<LineIcon.Circle cx="32" cy="48" r="2" />
			<LineIcon.Circle cx="16" cy="48" r="2" />
			<LineIcon.Circle cx="16" cy="16" r="2" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconGridHeavy = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M16 10 16 54" />
			<LineIcon.Path d="M32 10 32 54" />
			<LineIcon.Path d="M48 10 48 54" />
			<LineIcon.Path d="M10 48 54 48" />
			<LineIcon.Path d="M10 32 54 32" />
			<LineIcon.Path d="M10 16 54 16" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconGridHorizontalHeavy = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M10 47.99 54 47.99" />
			<LineIcon.Path d="M10 31.99 54 31.99" />
			<LineIcon.Path d="M10 15.99 54 15.99" />
			<LineIcon.Path d="M16.01 10 16.01 54" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconGridHorizontalLight = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M10 47.99 54 47.99" />
			<LineIcon.Path d="M10 31.99 54 31.99" />
			<LineIcon.Path d="M10 23.99 54 23.99" />
			<LineIcon.Path d="M10 39.99 54 39.99" />
			<LineIcon.Path d="M10 15.99 54 15.99" />
			<LineIcon.Path d="M16.01 10 16.01 54" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconGridLight = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M16 10 16 54" />
			<LineIcon.Path d="M24 10 24 54" />
			<LineIcon.Path d="M40 10 40 54" />
			<LineIcon.Path d="M32 10 32 54" />
			<LineIcon.Path d="M48 10 48 54" />
			<LineIcon.Path d="M10 48 54 48" />
			<LineIcon.Path d="M10 32 54 32" />
			<LineIcon.Path d="M10 24 54 24" />
			<LineIcon.Path d="M10 40 54 40" />
			<LineIcon.Path d="M10 16 54 16" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconGridVerticalHeavy = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M15.99 10 15.99 54" />
			<LineIcon.Path d="M31.99 10 31.99 54" />
			<LineIcon.Path d="M47.99 10 47.99 54" />
			<LineIcon.Path d="M10 16.01 54 16.01" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconGridVerticalLight = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M16 10 16 54" />
			<LineIcon.Path d="M32 10 32 54" />
			<LineIcon.Path d="M40 10 40 54" />
			<LineIcon.Path d="M24 10 24 54" />
			<LineIcon.Path d="M48 10 48 54" />
			<LineIcon.Path d="M10 16 54 16" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconInformation = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Circle cx="32" cy="17" r="2" />
			<LineIcon.Path d="M32 51 32 29" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconMagnifyingGlass = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Circle cx="27.56" cy="27.56" r="15.56" />
			<LineIcon.Path d="M39.78 39.78 52 52" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconMinus = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M14 32 50 32" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconPin = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M54 27.51a22 22 0 1 0-36 17l14 14 14-14a22 22 0 0 0 8-17z" />
			<LineIcon.Circle cx="32" cy="27.51" r="15" weight="2" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconPlus = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M16 32 48 32" />
			<LineIcon.Path d="M32 16 32 48" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconQuestion = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M32 37.5c0-6 10-6 10-14a10 10 0 1 0-20 0" />
			<LineIcon.Circle cx="32" cy="47.5" r="3" />
			<LineIcon.Circle cx="32" cy="47.5" r="2" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconSettings = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M16 44 16 52" />
			<LineIcon.Path d="M32 28 32 36" />
			<LineIcon.Path d="M48 12 48 20" />
			<LineIcon.Path d="M22 48 56 48" />
			<LineIcon.Path d="M8 32 26 32" />
			<LineIcon.Path d="M8 48 14 48" />
			<LineIcon.Path d="M34 32 56 32" />
			<LineIcon.Path d="M8 16 42 16" />
			<LineIcon.Path d="M50 16 56 16" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconStar = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M34.39 9.81a2.48 2.48 0 0 0-4.78 0L25.1 24.33H10.51a2.53 2.53 0 0 0-2.39 1.81A2.72 2.72 0 0 0 9 29.08l11.8 9-4.47 14.48a2.71 2.71 0 0 0 .91 2.94 2.42 2.42 0 0 0 3 0l11.81-9 11.81 9a2.42 2.42 0 0 0 2.95 0 2.71 2.71 0 0 0 .91-2.94l-4.56-14.51 11.8-9a2.72 2.72 0 0 0 .92-2.94 2.53 2.53 0 0 0-2.39-1.81H38.9z" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconTick = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M50 20 26 44 14 32" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);

export const LineIconUpload = (props: LineIconProps): JSX.Element => (
	<LineIcon.Svg viewBox="0 0 64 64" role="img">
		<LineIcon.Title>{props.title}</LineIcon.Title>
		<LineIcon.BaseWrapper>
			<LineIcon.Path d="M50 38v8a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4v-8" />
			<LineIcon.Path d="M23 22.5 32 13.5 41 22.5" />
			<LineIcon.Path d="M32 14 32 38" />
		</LineIcon.BaseWrapper>
	</LineIcon.Svg>
);
