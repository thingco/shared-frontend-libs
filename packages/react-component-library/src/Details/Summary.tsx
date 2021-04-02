import React from "react";
import { Box, BoxProps, ThemeUIStyleObject } from "theme-ui";

export interface SummaryProps extends BoxProps {
	children?: React.ReactNode;
	sx?: ThemeUIStyleObject;
}

/**
 * The disclosure summary element. See [the MDN entry](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/summary)
 * for a description. For it to work, it needs to be nested within a `<Details>` element.
 *
 * @param root0
 * @param root0.children
 * @param root0.sx
 * @visibleName Details.Summary
 */
export const Summary = ({ children, sx = {} }: SummaryProps): JSX.Element => (
	<Box as="summary" sx={sx}>
		{children}
	</Box>
);
