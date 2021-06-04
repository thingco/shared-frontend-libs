import { styled } from "../config";
import { TypeScaleName } from "../type-scale";

/**
 * Text components are all by default either paragraph or
 * h1 elements. Use the `as` prop in-app to render them
 * if a different element is needed in context.
 */

/**
 * All text styles use the same object, so generate them.
 *
 * @param themeTokenName - the token that'll be used in the generated object.
 * @returns
 */
function generateBaseTextStyles(themeTokenName: TypeScaleName): Record<string, string> {
	return {
		fontSize: `$${themeTokenName}`,
		fontWeight: `$${themeTokenName}`,
		letterSpacing: `$${themeTokenName}`,
		lineHeight: `$${themeTokenName}`,
	};
}

/**
 * Caption text is very small. To be used sparingly, particularly for the "small"
 * variant (which should ideally use small caps).
 */
export const Caption = styled("p", {
	variants: {
		size: {
			small: generateBaseTextStyles("captionsmall"),
			regular: generateBaseTextStyles("caption"),
		},
	},
	defaultVariants: {
		size: "regular",
	},
});

/**
 * Text is the base element of this module. It's likely the base element of any
 * app built from this library. Comes in "small" and "large" variants, but the
 * default "body" variant is likely to be the most used.
 */
export const Text = styled("p", {
	variants: {
		size: {
			small: generateBaseTextStyles("bodysmall"),
			body: generateBaseTextStyles("body"),
			large: generateBaseTextStyles("bodylarge"),
		},
	},
	defaultVariants: {
		size: "body",
	},
});

export const Title = styled("h1", {
	variants: {
		size: {
			body: generateBaseTextStyles("bodytitle"),
			large: generateBaseTextStyles("title"),
		},
	},
	defaultVariants: {
		size: "body",
	},
});
