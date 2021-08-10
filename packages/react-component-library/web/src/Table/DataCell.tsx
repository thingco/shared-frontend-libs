import React from "react";
import { Box, BoxProps, ThemeUIStyleObject } from "theme-ui";

export interface TableDataCellProps extends BoxProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
	testid?: string;
}

/**
 * @param root0
 * @param root0.children
 * @param root0.sx
 * @param root0.testid
 * @visibleName Table.DataCell
 */
export const DataCell = ({
	children,
	sx = {},
	testid = "Cell",
}: TableDataCellProps): JSX.Element => (
	<Box
		data-testid={testid}
		as="td"
		sx={{ p: "base", "&:last-child": { textAlign: "right" }, ...sx }}
	>
		{children}
	</Box>
);
