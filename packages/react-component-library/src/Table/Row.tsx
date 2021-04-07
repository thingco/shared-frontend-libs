import React from "react";
import { Box, BoxProps, ThemeUIStyleObject } from "theme-ui";

export interface TableRowProps extends BoxProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
	rowStyle?: "zebra" | "none";
	testid?: string;
}

/**
 * @param root0
 * @param root0.children
 * @param root0.rowStyle
 * @param root0.sx
 * @param root0.testid
 * @visibleName Table.Row
 */
export const Row = ({
	children,
	rowStyle = "zebra",
	sx = {},
	testid = "Row",
}: TableRowProps): JSX.Element => (
	<Box
		data-testid={testid}
		as="tr"
		sx={{
			"&:nth-of-type(odd)": {
				bg: rowStyle === "zebra" ? "background" : "transparent",
			},
			...sx,
		}}
	>
		{children}
	</Box>
);
