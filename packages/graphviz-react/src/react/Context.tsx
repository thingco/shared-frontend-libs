import { GraphData } from "@thingco/graphviz";
import React from "react";

/**
 * NOTE the context is defined apart from the Provider to prevent circular dependencies
 * occuring when main `Graph.tsx` file was broken down into separate discrete files.
 */
export const GraphContext = React.createContext<GraphData | null>(null);

export function useGraph(): GraphData {
	const graph = React.useContext(GraphContext);

	if (!GraphContext) {
		throw new Error(
			"Graph values can only be accessed from within a graph context provider."
		);
	} else if (!graph) {
		throw new Error(
			"Graph provider value is null: cannot access anything from it, please configure it correctly."
		);
	}

	return graph;
}
