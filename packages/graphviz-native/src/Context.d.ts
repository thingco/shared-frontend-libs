import React from "react";
import type { GraphData } from "@thingco/graphviz";
/**
 * NOTE the context is defined apart from the Provider to prevent circular dependencies
 * occuring when main `Graph.tsx` file was broken down into separate discrete files.
 */
export declare const GraphContext: React.Context<any>;
/**
 *
 */
export declare function useGraph(): GraphData;
//# sourceMappingURL=Context.d.ts.map
