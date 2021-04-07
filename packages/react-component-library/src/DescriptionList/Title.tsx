import React from "react";
import { Text, TextProps, ThemeUIStyleObject } from "theme-ui";

export interface DefinitionListTitleProps extends TextProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
}
export const Title = ({ children, sx = {} }: DefinitionListTitleProps): JSX.Element => (
	<Text
		as="dt"
		sx={{
			color: "muted",
			fontWeight: "bold",
			fontSize: "inherit",
			"::after": {
				content: `"\\3A "`,
			},
			...sx,
		}}
	>
		{children}
	</Text>
);
