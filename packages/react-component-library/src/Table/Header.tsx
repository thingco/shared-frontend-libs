import React from "react";
import { Box, BoxProps, ThemeUIStyleObject } from "theme-ui";

export interface TableHeaderProps extends BoxProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
}
/**
 * @param root0
 * @param root0.children
 * @param root0.sx
 * @visibleName Table.Header
 */
export const Header = ({ children, sx = {} }: TableHeaderProps) => (
	<Box as="thead" sx={sx}>
		{children}
	</Box>
);
