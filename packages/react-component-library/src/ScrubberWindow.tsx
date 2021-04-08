/** @jsxImportSource theme-ui */
import React from "react";
import { Slider } from "theme-ui";

export interface ScrubberWindowProps {
	/** The element to put inside the scrubber viewport */
	children: React.ReactNode;
	/** The height to set the scrubber viewport */
	height: number | string;
	/** The _unitless_ fixed pixel width of the element that goes inside the scrubber viewport */
	fixedWidth: number;
	/** The current position of the scrubber */
	currentIndex: number;
	/** The far right extremity of the scrubber */
	maxIndex: number;
	/** Used to set the current position of the scrubber */
	setCurrentIndex: (n: number) => void;
}

export const ScrubberWindow = ({
	children,
	height,
	fixedWidth,
	maxIndex,
	currentIndex,
	setCurrentIndex,
}: ScrubberWindowProps): JSX.Element => {
	const scrubWindowRef = React.useRef<HTMLDivElement>(null);
	const [slidingWindowWidth, setSlidingWindowWidth] = React.useState(0);
	const [slideAmount, setSlideAmount] = React.useState(0);

	React.useLayoutEffect(() => {
		const scrubWindowWidth = (scrubWindowRef.current as HTMLDivElement).clientWidth;

		if (fixedWidth <= scrubWindowWidth) {
			setSlidingWindowWidth(fixedWidth);
		} else {
			setSlidingWindowWidth((scrubWindowRef.current as HTMLDivElement).clientWidth);
		}
	}, [scrubWindowRef.current, fixedWidth]);

	const scrubHandler = (e: React.ChangeEvent) => {
		const speedgraphWidth = fixedWidth;
		const overflow = slidingWindowWidth - speedgraphWidth;
		const percent = +(e.target as HTMLInputElement).value / maxIndex;

		setCurrentIndex(+(e.target as HTMLInputElement).value);
		setSlideAmount(percent * overflow);
	};

	return (
		<div
			ref={scrubWindowRef}
			sx={{ height, position: "relative", overflowX: "hidden", overflowY: "visible" }}
		>
			<div sx={{ transform: `translateX(${slideAmount}px)` }}>
				{children}
				<Slider
					sx={{
						outline: "none",
						height: "100%",
						width: "100%",
						top: 0,
						display: "block",
						position: "absolute",
						zIndex: 1,
						backgroundColor: "transparent",
						/** NOTE these are literally all exactly the same, but Typescript
						 * throws a hissy fit if I just use the same object of each one,
						 * so each has the same object copy-pasted instead.
						 */
						"&::-webkit-slider-thumb": {
							height: height,
							width: 4,
							backgroundColor: "secondary",
							border: 0,
							borderRadius: 0,
							display: "block",
							position: "relative",
						},
						"&::-moz-range-thumb": {
							height: height,
							width: 4,
							backgroundColor: "secondary",
							border: 0,
							borderRadius: 0,
							display: "block",
							position: "relative",
						},
						"&::-ms-thumb": {
							height: height,
							width: 4,
							backgroundColor: "secondary",
							border: 0,
							borderRadius: 0,
							display: "block",
							position: "relative",
						},
					}}
					min={0}
					max={maxIndex}
					step={1}
					value={currentIndex}
					onChange={scrubHandler}
				/>
			</div>
		</div>
	);
};
