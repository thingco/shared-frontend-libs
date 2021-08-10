import React from "react";
import { Box, BoxProps, ThemeUIStyleObject } from "theme-ui";

export interface TableHeaderCellProps extends BoxProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
}

/**
 * @param root0
 * @param root0.children
 * @param root0.sx
 * @visibleName Table.HeaderCell
 */
export const HeaderCell = ({ children, sx = {} }: TableHeaderCellProps): JSX.Element => (
	<Box
		as={children === " " ? "td" : "th"}
		sx={{
			textAlign: "left",
			fontWeight: "body",
			color: "muted",
			p: "base",
			"&:last-child": { textAlign: "right" },
			...sx,
		}}
	>
		{children}
	</Box>
);
