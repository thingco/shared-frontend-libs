import { useState } from "react";
import { ComponentPropsWithRef, forwardRef, ReactNode } from "react";

import { styled } from "../config";
import { Button } from "./Buttons";
import { Box, Stack } from "./Layout";
import { LineIcon } from "./LineIcons";

const StyledTextInput = styled("input", {
	$$buttonSpaceLg: "$space$full",
	$$buttonSpaceMd: "$space$half",
	$$buttonSpaceSm: "$space$third",
	$$roundedRadius: "100px",
	// Scoped CSS variables for the padding allow the padding to be
	// adjusted via variants:
	$$pt: "$$buttonSpaceSm",
	$$pr: "$$buttonSpaceSm",
	$$pb: "$$buttonSpaceSm",
	$$pl: "$$buttonSpaceSm",
	padding: "$$pt $$pr $$pb $$pl",
	// Core typography from scale, reusing the button scale
	// REVIEW, should just be a general scale value
	fontSize: "$button",
	fontWeight: 400,
	lineHeight: "$button",
	letterSpacing: "$button",
	// Core input basics
	appearance: "none",
	display: "block",
	width: "100%",
	// Base colour/border styles
	backgroundColor: "transparent",
	border: "2px solid $dark",
	borderRadius: "$4",
	color: "inherit",
	"&:focus": {
		backgroundColor: "$mid",
	},
	"&:disabled": {
		backgroundColor: "$mid",
		cursor: "not-allowed",
		opacity: 0.5,
	},
});

const StyledCheckbox = styled("input", {});

const StyledRadio = styled("input", {});

const StyledLabel = styled("label", {
	fontSize: "$bodysmall",
	fontWeight: "$bodysmall",
	lineHeight: "$bodysmall",
	letterSpacing: "$bodysmall",
	// Core label basics. In general, want to place labels above inputs,
	// so they need to be blocks rather than inline.
	display: "block",
	width: "100%",
});

export interface TextInputProps {
	label: string | ReactNode;
}

// TODO focus state
export const TextInput = StyledTextInput;
export const TextInputLabel = StyledLabel;

// TODO Errors, help text, REVIEW propbably not needed
export const TextInputGroup = forwardRef<
	HTMLInputElement,
	ComponentPropsWithRef<"input"> & TextInputProps
>(({ label, ...props }, ref) => (
	<Stack css={{ rowGap: "$quarter" }}>
		<StyledLabel css={{ paddingLeft: "$third" }}>{label}</StyledLabel>
		<StyledTextInput ref={ref} {...props} />
	</Stack>
));

export const PasswordInput = forwardRef<HTMLInputElement, ComponentPropsWithRef<"input">>(
	(props, ref) => {
		const [isVisible, setIsVisible] = useState(false);

		return (
			<Box css={{ position: "relative" }}>
				<TextInput
					css={{ paddingRight: "calc($space$twelfth + $space$full + $space$threequarter)" }}
					ref={ref}
					type={isVisible ? "text" : "password"}
					placeholder="Enter your password"
					{...props}
				/>
				<Button
					css={{
						height: "calc($space$twelfth + $space$full + $space$threequarter)",
						width: "calc($space$twelfth + $space$full + $space$threequarter)",
						position: "absolute",
						right: 0,
						top: 0,
						border: 0,
					}}
					appearance="outline"
					buttonRole="primary"
					padding="equal"
					onClick={() => setIsVisible(!isVisible)}
				>
					<LineIcon
						icontype={isVisible ? "EyeClosed" : "EyeOpen"}
						title={isVisible ? "Hide password" : "Show password"}
					/>
				</Button>
			</Box>
		);
	}
);
