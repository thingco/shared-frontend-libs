import { GraphData } from "@thingco/graphviz";
import React from "react";
/**
 * NOTE the context is defined apart from the Provider to prevent circular dependencies
 * occuring when main `Graph.tsx` file was broken down into separate discrete files.
 */
export declare const GraphContext: React.Context<GraphData | null>;
export declare function useGraph(): GraphData;
//# sourceMappingURL=Context.d.ts.map