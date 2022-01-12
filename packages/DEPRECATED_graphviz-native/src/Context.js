"use strict";
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGraph = exports.GraphContext = void 0;
const react_1 = __importDefault(require("react"));
/**
 * NOTE the context is defined apart from the Provider to prevent circular dependencies
 * occuring when main `Graph.tsx` file was broken down into separate discrete files.
 */
exports.GraphContext = react_1.default.createContext(null);
/**
 *
 */
function useGraph() {
	const graph = react_1.default.useContext(exports.GraphContext);
	if (!exports.GraphContext) {
		throw new Error("Graph values can only be accessed from within a graph context provider.");
	} else if (!graph) {
		throw new Error(
			"Graph provider value is null: cannot access anything from it, please configure it correctly."
		);
	}
	return graph;
}
exports.useGraph = useGraph;
//# sourceMappingURL=Context.js.map
