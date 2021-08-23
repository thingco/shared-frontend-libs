import React from "react";
import { View } from "./Containers";
import { Text } from "./Typography";
export const Hint = ({ children }) => {
    return (React.createElement(View, { style: {
            marginTop: 10,
        } },
        React.createElement(View, { variant: "flexRow" },
            React.createElement(View, { variant: "hint" },
                React.createElement(Text, { variant: "hintSymbol" }, "i")),
            React.createElement(Text, { variant: "hint" }, children))));
};
export const ValidationError = ({ children }) => {
    return (React.createElement(View, { style: {
            marginTop: 10,
        } },
        React.createElement(View, { variant: "flexRow" },
            children && (React.createElement(View, { variant: "error" },
                React.createElement(Text, { variant: "hintSymbol" }, "!"))),
            React.createElement(Text, { variant: "error" }, children))));
};
//# sourceMappingURL=Hint.js.map