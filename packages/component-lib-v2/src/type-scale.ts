import { TTheme } from "@stitches/react";

export type TypeScaleName =
	| "captionsmall"
	| "caption"
	| "button"
	| "bodysmall"
	| "body"
	| "bodylarge"
	| "bodytitle"
	| "title";

export type TypeScaleFontSize = number;
export type TypeScaleLineHeight = number;
export type TypeScaleLetterSpacing = number;
export type TypeScaleFontWeight = number;

// prettier-ignore
export type TypeScale = [TypeScaleName, TypeScaleFontSize, TypeScaleLineHeight, TypeScaleLetterSpacing, TypeScaleFontWeight][];

// prettier-ignore
export const typeScale: TypeScale = [
	["captionsmall",	10,		12,		1.5,	400],
	["caption",			12,		16,		0.4,	400],
	["button",			14,		24,		1.25,	700],
	["bodysmall",		14,		24,		0.25,	400],
	["body",			16,		24,		0.5,	400],
	["bodylarge",		18,		24,		0.25,	400],
	["bodytitle",		16,		24,		0.15,	700],
	["title",			24,		36,		0.0,	400],
];

export type SpaceScaleName = "twelfth" | "sixth" | "quarter" | "half" | "threequarter" | "full";

export type SpaceScale = [SpaceScaleName, number][];

// prettier-ignore
export const spaceScale: SpaceScale = [
	["twelfth",			2],
	["sixth",			4],
	["quarter",			8],
	["half", 			12],
	["threequarter",	16],
	["full",			24],
];

export function roundTo(num: number, precision: number): number {
	const f = 10 ** precision;
	return Math.round((num + Number.EPSILON) * f) / f;
}

export function buildWebThemeSizes(
	tScale: TypeScale = typeScale,
	sScale: SpaceScale = spaceScale
): TTheme {
	const sizes: TTheme = {
		fontSizes: {},
		fontWeights: {},
		letterSpacings: {},
		lineHeights: {},
		space: {},
	};

	for (const [name, size, lineheight, spacing, weight] of tScale) {
		const remSize = size / 16;
		const emSpacing = (spacing / size) * remSize;
		const lineH = lineheight / size;

		sizes.fontSizes![name] = `${roundTo(remSize, 3)}rem`;
		sizes.fontWeights![name] = `${weight}`;
		sizes.letterSpacings![name] = `${roundTo(emSpacing, 3)}em`;
		sizes.lineHeights![name] = roundTo(lineH, 3);
	}

	for (const [name, size] of sScale) {
		const remSize = size / 16;

		sizes.space![name] = `${roundTo(remSize, 3)}rem`;
	}

	console.table(sizes);
	return sizes;
}
