import React from "react";
import { Text, TextProps, ThemeUIStyleObject } from "theme-ui";

export interface DefinitionListDescProps extends TextProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
}

export const Desc = ({ children, sx = {} }: DefinitionListDescProps): JSX.Element => (
	<Text
		as="dd"
		sx={{
			fontSize: "inherit",
			pb: "xsmall",
			...sx,
		}}
	>
		{children}
	</Text>
);
