import React from "react";
import { Grid, GridProps, ThemeUIStyleObject } from "theme-ui";

export interface CardBodyProps extends GridProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
}

/**
 * @param root0
 * @param root0.children
 * @param root0.sx
 * @visibleName Card.Body
 */
export const Body = ({ children, sx = {} }: CardBodyProps): JSX.Element => (
	<Grid sx={sx}>{children}</Grid>
);
