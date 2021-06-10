import { buildWebThemeSizes } from "./type-scale";

const { fontSizes, fontWeights, letterSpacings, lineHeights, radii, space } = buildWebThemeSizes();

export const baseTheme = {
	colors: {
		dark: "#2f2f2f",
		mid: "#969696",
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
	sizes: {},
	borderWidths: {
		thin: "1px",
		base: "2px",
	},
	borderStyles: {},
	radii,
	shadows: {},
	zIndices: {},
	transitions: {},
};
