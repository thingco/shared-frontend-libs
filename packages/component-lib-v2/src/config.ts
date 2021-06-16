import { createCss } from "@stitches/react";

import { baseTheme } from "./theme";

export const {
	/**
	 * A function to create a component including its styles and variants.
	 * Used for creating all the components:
	 */
	styled,
	/**
	 * A function to generate class names from a style object.
	 * Currently unused.
	 */
	// css,
	/**
	 * A function for handling things like global resets, yallows global CSS styles.
	 */
	global,
	/**
	 * Due to the vagaries of css-in-js, have to shove keyframes into a global
	 * context. Here's the function for doing that:
	 */
	keyframes,
	/**
	 * For server-side rendering.
	 * Currently unused.
	 */
	// getCssString,
	/**
	 *
	 */
	theme,
} = createCss({
	/**
	 * `theme` is the design theme, and its properties map to CSS properties.
	 */
	theme: baseTheme,
	/**
	 * `media` defines reusable responsive breakpoints.
	 * Currently unused.
	 */
	// media: {},
	/**
	 * `utils` defines reusable responsive breakpoints.
	 * Currently unused.
	 */
	// utils: {},
	/**
	 * `prefix` prefixes all classnames to avoid clashes.
	 */
	prefix: "thingco",
	/**
	 * `insetionMethod` defines how the `style` tag is inserted.
	 * Currently unused.
	 */
	// insertionMethod: "append",
	/**
	 * `themeMap` allows defining of custom mappings of CSS properties to
	 * theme tokens.
	 * Currently unused.
	 */
	// themeMap: {}
});
