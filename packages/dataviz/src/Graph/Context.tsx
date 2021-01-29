import React from "react";

import { GraphData } from "./setup";

/**
 * NOTE the context is defined apart from the Provider to prevent circular dependencies
 * occuring when main `Series.tsx` file was broken down into separate discrete files.
 */
export const GraphContext = React.createContext<GraphData | null>(null);

export function useGraph(): GraphData {
	const graph = React.useContext(GraphContext);

	if (!GraphContext) {
		throw new Error(
			"Series values can only be accessed from within a series context provider."
		);
	} else if (!graph) {
		throw new Error(
			"Series provider value is null: cannot access anything from it, please configure it correctly."
		);
	}

	return graph;
}
