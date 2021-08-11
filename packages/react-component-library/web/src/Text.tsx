import React from "react";
import { Text as ThemeUIText, TextProps as ThemeUITextProps, ThemeUIStyleObject } from "theme-ui";

import { Em, EmProps } from "./Text/Em";
import { Strong, StrongProps } from "./Text/Strong";

export interface IText extends React.FC {
	Em: React.FC<EmProps>;
	Strong: React.FC<StrongProps>;
}

export interface TextProps extends ThemeUITextProps {
	children?: React.ReactNode;
	as?: React.ElementType;
	variant?: string;
	sx?: ThemeUIStyleObject;
	testid?: string;
}

/**
 * Just a wrapper around Theme UI's `Text` component. All
 * Theme UI components are built off a single element (a `<div>`),
 * whereas the majority of actual text elements in the app are going
 * to be `<p>` elements.
 *
 * @param root0
 * @param root0.children
 * @param root0.as
 * @param root0.variant
 * @param root0.sx
 * @param root0.testid
 */
export const Text = ({
	children,
	as = "p",
	variant = "default",
	sx = {},
	testid = "Text",
}: TextProps): JSX.Element => (
	<ThemeUIText data-testid={testid} as={as} variant={variant} sx={{ fontFamily: "body", ...sx }}>
		{children}
	</ThemeUIText>
);

Text.Em = Em;
Text.Strong = Strong;
