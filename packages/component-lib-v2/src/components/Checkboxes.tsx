import { ComponentPropsWithRef, forwardRef } from "react";

import { styled } from "../config";
import { LineIcon } from "./LineIcons";

type StyledCheckboxWrapperSize = "small" | "medium" | "large";

const StyledCheckboxWrapper = styled("div", {
	position: "relative",
	variants: {
		boxSize: {
			small: {
				height: "$space$full",
				width: "$space$full",
			},
			medium: {
				height: "calc($space$full + $space$half)",
				width: "calc($space$full + $space$half)",
			},
			large: {
				height: "calc($space$full * 2)",
				width: "calc($space$full * 2)",
			},
		},
	},
	defaultVariants: {
		boxSize: "small",
	},
});

const StyledCheckbox = styled("div", {
	position: "absolute",
	width: "100%",
	height: "100%",
	backgroundColor: "transparent",
	border: "2px solid $dark",
	borderRadius: "$4",
	pointerEvents: "none",
	"& svg *": {
		stroke: "transparent",
	},
});

const StyledHiddenCheckbox = styled("input", {
	appearance: "none",
	position: "absolute",
	width: "100%",
	height: "100%",
	display: "block",
	[`&:checked + ${StyledCheckbox}`]: {
		backgroundColor: "$dark",
	},
	[`&:checked + ${StyledCheckbox} svg *`]: {
		stroke: "$light",
	},
});

interface CheckboxProps extends ComponentPropsWithRef<"input"> {
	boxSize?: StyledCheckboxWrapperSize;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	({ boxSize, ...props }, ref) => (
		<StyledCheckboxWrapper boxSize={boxSize}>
			<StyledHiddenCheckbox ref={ref} type="checkbox" {...props} />
			<StyledCheckbox>
				<LineIcon icontype="Tick" title="Checkbox tick" />
			</StyledCheckbox>
		</StyledCheckboxWrapper>
	)
);
