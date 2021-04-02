import React from "react";
import { Box, BoxProps } from "theme-ui";

import { Summary } from "./Details/Summary";

export interface DetailsProps extends BoxProps {
	open?: boolean;
	testid?: string;
}

/**
 * The details disclosure element. See [the MDN entry](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details)
 * for a description. For it to work, it requires a `<Summary>` element nested within it.
 *
 * NOTE the element accepts an `open` boolean prop. This allows programmatic
 * control over whether it is open or closed (_ie_ whether it just shows the
 * summary or whether it shows the full extended description). To make this
 * work as a controlled component, `event.preventDefault` **must** be used
 * in the event handler callback used to control the behaviour of the element.
 *
 * @param root0
 * @param root0.testid
 */
export const Details = ({ testid = "details", ...props }: DetailsProps): JSX.Element => (
	<Box as="details" {...props} data-testid={testid}>
		{props.children}
	</Box>
);

Details.Summary = Summary;
