import { styled } from "../config";
import { memo } from "react";

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

export const LineIconCarFront = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElRect x="10" y="46" rx="2" />
			<LineIconElRect x="46" y="46" rx="2" />
			<LineIconElPath d="M8 44V32c0-2.21 2-4 4-5l2-1 4-8a3.7 3.7 0 0 1 3-2h22a3.7 3.7 0 0 1 3 2l4 8 2 1c2 1 4 2.79 4 5v12a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2z" />
			<LineIconElPath weight="2" d="M52 27 12 27" />
			<LineIconElPath
				weight="2"
				d="M12 27H8a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h7l-1 2zM52 27h4a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-7l1 2zM21.74 40.41l-2.49-5.6A2 2 0 0 1 21.08 32h21.84a2 2 0 0 1 1.83 2.81l-2.49 5.6a1 1 0 0 1-.91.59h-18.7a1 1 0 0 1-.91-.59zM56 32l-6.33.9a1 1 0 0 0-.83.75l-.49 1.93a1 1 0 0 0 1.1 1.24L56 36zM8 32l6.33.9a1 1 0 0 1 .83.75l.49 1.93a1 1 0 0 1-1.1 1.24L8 36z"
			/>
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconCarSide = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElCircle cx="15" cy="39" r="4" />
			<LineIconElCircle cx="48" cy="39" r="4" />
			<LineIconElPath d="M18.87 40 44.13 40" />
			<LineIconElPath weight="2" d="M18 26 16 29 36 30" />
			<LineIconElPath weight="2" d="M28 26 28 29.6" />
			<LineIconElPath d="M51.87 40H54a4 4 0 0 0 4-4v-3.34a2 2 0 0 0-1.63-2L42 28l-8.1-4.86A8 8 0 0 0 29.78 22H14.67a2 2 0 0 0-1.2.4L7.6 26.8A4 4 0 0 0 6 30v6a4 4 0 0 0 4 4h1.13" />
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

export const LineIconCross = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M18 46 46 18" />
			<LineIconElPath d="M18 18 46 46" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconDialAlt = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElG weight="2">
				<LineIconElCircle cx="32" cy="31.75" r=".58" />
				<LineIconElPath d="M38.16 28.19 32 31.75" />
				<LineIconElPath d="M32 20.21 32 16.75" />
				<LineIconElPath d="M43.54 31.75 47 31.75" />
				<LineIconElPath d="M17 31.75 20.46 31.75" />
				<LineIconElPath d="M37.77 21.76 39.5 18.76" />
				<LineIconElPath d="M19.01 24.25 22.01 25.98" />
				<LineIconElPath d="M41.99 25.98 44.99 24.25" />
				<LineIconElPath d="M24.5 18.76 26.23 21.76" />
				<LineIconElPath d="m42 37.52 3 1.73a15 15 0 1 0-26 0l3-1.73" />
			</LineIconElG>
			<LineIconElCircle cx="32" cy="32" r="22" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconDial = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElG weight="2">
				<LineIconElCircle cx="32" cy="35" r=".85" />
				<LineIconElPath d="M43.72 28.23 32 35" />
				<LineIconElPath d="M32 18.08 32 13" />
				<LineIconElG>
					<LineIconElPath d="M48.92 35 54 35" />
					<LineIconElPath d="M10 35 15.08 35" />
				</LineIconElG>
				<LineIconElPath d="M40.46 20.34 43 15.95" />
				<LineIconElPath d="M12.95 24 17.34 26.54" />
				<LineIconElPath d="M46.66 26.54 51.05 24" />
				<LineIconElPath d="M21 15.95 23.54 20.34" />
			</LineIconElG>
			<LineIconElPath d="M46.66 43.46 51.05 46A22 22 0 1 0 10 35a21.83 21.83 0 0 0 3 11l4.39-2.54" />
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

export const LineIconInformationCircle = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElCircle cx="32" cy="32" r="21" />
			<LineIconElCircle cx="32" cy="21.22" r="1.47" />
			<LineIconElPath d="M32 43.75 32 30.04" />
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

export const LineIconList = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElG>
				<LineIconElPath d="M22 47.99 54 47.99" />
				<LineIconElPath d="M22 31.99 54 31.99" />
				<LineIconElPath d="M22 15.99 54 15.99" />
			</LineIconElG>
			<LineIconElCircle cx="12" cy="16" r="2" />
			<LineIconElCircle cx="12" cy="32" r="2" />
			<LineIconElCircle cx="12" cy="48" r="2" />
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

export const LineIconPinAlt = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M53.18 27.18a21.18 21.18 0 1 0-34.66 16.34L32 57l13.47-13.47a21.15 21.15 0 0 0 7.71-16.35z" />
			<LineIconElCircle cx="32" cy="27.18" r="14.44" weight="2" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

export const LineIconPin = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M18 20v24l14 14 14-14V20a14 14 0 0 0-28 0z" />
			<LineIconElCircle cx="32" cy="20" r="7" weight="2" />
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

export const LineIconQuestionCircle = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElCircle cx="32" cy="32" r="22" />
			<LineIconElPath d="M32 34.22c0-3.59 6-3.59 6-8.39a6 6 0 1 0-12 0" />
			<LineIconElCircle cx="32" cy="43.62" r="2.25" />
			<LineIconElCircle cx="32" cy="42.22" r="1.2" />
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
			<LineIconElPath d="M34.39 7.81a2.48 2.48 0 0 0-4.78 0L25.1 22.33H10.51a2.53 2.53 0 0 0-2.39 1.81A2.72 2.72 0 0 0 9 27.08l11.8 9-4.47 14.48a2.71 2.71 0 0 0 .91 2.94 2.42 2.42 0 0 0 3 0l11.81-9 11.81 9a2.42 2.42 0 0 0 2.95 0 2.71 2.71 0 0 0 .91-2.94l-4.56-14.51 11.8-9a2.72 2.72 0 0 0 .92-2.94 2.53 2.53 0 0 0-2.39-1.81H38.9z" />
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

export const LineIconWarningTriangle = (props: LineIconProps): JSX.Element => (
	<LineIconElSvg viewBox="0 0 64 64" role="img">
		<LineIconElTitle>{props.title}</LineIconElTitle>
		<LineIconElBaseWrapper>
			<LineIconElPath d="M10 50 54 50 32 10.17 10 50z" />
			<LineIconElPath d="M32 34 32 26" />
			<LineIconElCircle cx="32" cy="41.5" r="1" />
		</LineIconElBaseWrapper>
	</LineIconElSvg>
);

type LineIconType =
	| "ArrowDown"
	| "ArrowLeft"
	| "ArrowRight"
	| "ArrowUp"
	| "CarFront"
	| "CarSide"
	| "Clock"
	| "ContractVertical"
	| "Cross"
	| "DialAlt"
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
	| "InformationCircle"
	| "Information"
	| "List"
	| "MagnifyingGlass"
	| "Minus"
	| "PinAlt"
	| "Pin"
	| "Plus"
	| "QuestionCircle"
	| "Question"
	| "Settings"
	| "Star"
	| "Tick"
	| "Upload"
	| "WarningTriangle";

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
			case "CarFront":
				return <LineIconCarFront {...props} />;
			case "CarSide":
				return <LineIconCarSide {...props} />;
			case "Clock":
				return <LineIconClock {...props} />;
			case "ContractVertical":
				return <LineIconContractVertical {...props} />;
			case "Cross":
				return <LineIconCross {...props} />;
			case "DialAlt":
				return <LineIconDialAlt {...props} />;
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
			case "InformationCircle":
				return <LineIconInformationCircle {...props} />;
			case "Information":
				return <LineIconInformation {...props} />;
			case "List":
				return <LineIconList {...props} />;
			case "MagnifyingGlass":
				return <LineIconMagnifyingGlass {...props} />;
			case "Minus":
				return <LineIconMinus {...props} />;
			case "PinAlt":
				return <LineIconPinAlt {...props} />;
			case "Pin":
				return <LineIconPin {...props} />;
			case "Plus":
				return <LineIconPlus {...props} />;
			case "QuestionCircle":
				return <LineIconQuestionCircle {...props} />;
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
			case "WarningTriangle":
				return <LineIconWarningTriangle {...props} />;
			default:
				return <p>INVALID ICON TYPE: {icontype}</p>;
		}
	}
);
