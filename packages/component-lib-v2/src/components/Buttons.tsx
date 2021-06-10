import { styled } from "../config";

/**
 * BUTTONS
 *
 * Complex, but buttons are that: there are a _lot_ of states. This should,
 * ideally, be used as a base -- it may be easier to have (for example) a
 * `CtaButton` and a `PrimaryButton` that set the specified variants. Maybe.
 *
 * Anyway, core things you might want to know:
 *
 * - Button text is 14 units (0.875 rem) & bold by default (REVIEW that)
 * - Line height is 24 units.
 * - Padding for default is 12 units top and bottom, so this gives a height
 *   of 48 units (3rem).
 */

/**
 * Styled components setup
 *
 */

const StyledButton = styled("button", {
	$$buttonMainColor: "$colors$mid",
	$$buttonContrastColor: "$colors$light",
	$$buttonSpaceLg: "$space$full",
	$$buttonSpaceMd: "$space$half",
	$$buttonSpaceSm: "$space$third",
	$$roundedRadius: "100px",
	// Scoped CSS variables for the padding allow the padding to be
	// adjusted via variants:
	$$pt: "$$buttonSpaceSm",
	$$pr: "$$buttonSpaceLg",
	$$pb: "$$buttonSpaceSm",
	$$pl: "$$buttonSpaceLg",
	padding: "$$pt $$pr $$pb $$pl",
	// Core typography from scale
	fontSize: "$button",
	fontWeight: "$button",
	lineHeight: "$button",
	letterSpacing: "$button",
	// Core button basics
	appearance: "none",
	border: "2px solid $dark",
	borderRadius: "$4",
	// boxShadow: "1px 2px 4px 0 currentColor",
	// Additional typography constraints
	textAlign: "center",
	textDecoration: "none",
	whiteSpace: "nowrap",
	// By applying flex, can allow children to sit side by side
	display: "flex",
	flexWrap: "nowrap",
	alignItems: "center",
	columnGap: "$quarter",
	"&:disabled": {
		cursor: "not-allowed",
		opacity: 0.5,
		// filter: "blur(1px)",
	},
	"&:hover": {
		filter: "brightness(0.75)",
	},
	variants: {
		appearance: {
			filled: {
				backgroundColor: "$$buttonMainColor",
				borderColor: "transparent",
				color: "$$buttonContrastColor",
			},
			outline: {
				backgroundColor: "transparent",
				borderColor: "$$buttonMainColor",
				color: "$$buttonMainColor",
			},
		},
		buttonRole: {
			primary: {
				$$buttonMainColor: "$colors$dark",
				$$buttonContrastColor: "$colors$light",
			},
			cta: {
				$$buttonMainColor: "$colors$dark",
				$$buttonContrastColor: "$colors$light",
			},
			secondary: {
				$$buttonMainColor: "$colors$mid",
				$$buttonContrastColor: "$colors$light",
			},
		},
		padding: {
			default: {
				$$pt: "$$buttonSpaceSm",
				$$pr: "$$buttonSpaceMd",
				$$pb: "$$buttonSpaceSm",
				$$pl: "$$buttonSpaceMd",
			},
			compact: {
				$$pt: "0",
				$$pr: "$$buttonSpaceSm",
				$$pb: "0",
				$$pl: "$$buttonSpaceSm",
			},
			equal: {
				$$pl: "$$pt",
				$$pr: "$$pt",
			},
		},
		rounded: {
			default: {
				borderRadius: "$4",
			},
			left: {
				borderRadius: "$$roundedRadius $4 $4 $$roundedRadius",
				$$pl: "$$buttonSpaceLg",
			},
			right: {
				borderRadius: "$4 $$roundedRadius $$roundedRadius $4",
				$$pr: "$$buttonSpaceLg",
			},
			both: {
				borderRadius: "$$roundedRadius",
				$$pl: "$$buttonSpaceLg",
				$$pr: "$$buttonSpaceLg",
			},
		},
	},
	defaultVariants: {
		appearance: "outline",
		buttonRole: "secondary",
		padding: "default",
		rounded: "default",
	},
});

export const Button = StyledButton;
