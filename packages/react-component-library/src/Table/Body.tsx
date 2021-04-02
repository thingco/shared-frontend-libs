import React from "react";
import { Box, BoxProps, ThemeUIStyleObject } from "theme-ui";

export interface TableBodyProps extends BoxProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
}

/**
 * @param root0
 * @param root0.children
 * @param root0.sx
 * @visibleName Table.Body
 */
export const Body = ({ children, sx = {} }: TableBodyProps): JSX.Element => (
	<Box as="tbody" sx={sx}>
		{children}
	</Box>
);
