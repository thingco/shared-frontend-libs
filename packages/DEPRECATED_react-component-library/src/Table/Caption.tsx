import React from "react";
import { Box, BoxProps, ThemeUIStyleObject } from "theme-ui";

export interface TableCaptionProps extends BoxProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
}
/**
 * @param root0
 * @param root0.children
 * @param root0.sx
 * @visibleName Table.Caption
 */
export const Caption = ({ children, sx = {} }: BoxProps): JSX.Element => (
	<Box as="caption" sx={sx}>
		{children}
	</Box>
);
