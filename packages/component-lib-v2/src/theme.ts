import { buildWebThemeSizes } from "./type-scale";

const { fontSizes, fontWeights, letterSpacings, lineHeights, space } = buildWebThemeSizes();

export const baseTheme = {
	colors: {
		dark: "#2f2f2f",
		mid: "#93959",
		light: "#fdfdfd",
		// Internal, used for design tooling
		__gridLight: "#ffcccc",
		__gridMid: "#ffb8b8",
		__gridDark: "#ea8685",
	},
	space,
	fontSizes,
	fonts: {
		base: `BlinkMacSystemFont, -apple-system, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", "Helvetica", "Arial", sans-serif`,
	},
	fontWeights,
	lineHeights,
	letterSpacings,
	sizes: {
		iconResponsive: "100%",
		iconText: "1em",
		iconXs: "$space$half",
		iconS: "$space$threequarter",
		iconM: "$space$full",
		iconL: "calc($space$full + $space$half)",
	},
	borderWidths: {
		thin: "1px",
		base: "2px",
	},
	borderStyles: {},
	radii: {},
	shadows: {},
	zIndices: {},
	transitions: {},
};
