import React from "react";
import { GraphData } from "./setup";
/**
 * NOTE the context is defined apart from the Provider to prevent circular dependencies
 * occuring when main `Series.tsx` file was broken down into separate discrete files.
 */
export declare const GraphContext: React.Context<GraphData | null>;
export declare function useGraph(): GraphData;
//# sourceMappingURL=Context.d.ts.map