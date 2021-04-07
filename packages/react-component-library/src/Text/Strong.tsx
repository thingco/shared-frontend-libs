import React from "react";
import { Text, TextProps, ThemeUIStyleObject } from "theme-ui";

export interface StrongProps extends TextProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
}

/**
 * @param root0
 * @param root0.children
 * @param root0.sx
 * @visibleName Text.Strong
 */
export const Strong = ({ children, sx = {} }: StrongProps): JSX.Element => (
	<Text as="strong" sx={{ display: "inline", fontWeight: "bold", fontFamily: "inherit", ...sx }}>
		{children}
	</Text>
);
