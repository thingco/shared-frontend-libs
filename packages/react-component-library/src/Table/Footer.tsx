import React from "react";
import { Box, BoxProps, ThemeUIStyleObject } from "theme-ui";

export interface TableFooterProps extends BoxProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
}
/**
 * @param root0
 * @param root0.children
 * @param root0.sx
 * @visibleName Table.Footer
 */
export const Footer = ({ children, sx = {} }: TableFooterProps): JSX.Element => (
	<Box as="tfoot" sx={sx}>
		{children}
	</Box>
);
