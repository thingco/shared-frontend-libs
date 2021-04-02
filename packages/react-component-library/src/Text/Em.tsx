import React from "react";
import { Text, TextProps, ThemeUIStyleObject } from "theme-ui";

export interface EmProps extends TextProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
}

/**
 * @param root0
 * @param root0.children
 * @param root0.sx
 * @visibleName Text.Em
 */
export const Em = ({ children, sx = {} }: EmProps): JSX.Element => (
	<Text
		as="em"
		sx={{
			display: "inline",
			fontStyle: "italic",
			fontFamily: "inherit",
			...sx,
		}}
	>
		{children}
	</Text>
);
