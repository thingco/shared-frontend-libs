import React from "react";
import { View as RNView, ScrollView as RNScrollView, } from "react-native";
import { variantToTheme } from "../util";
export const View = ({ children, variant = "", style = [], ...props }) => {
    style = style instanceof Array ? style : [style];
    const styles = variantToTheme({ component: "view", styles: variant });
    return (React.createElement(RNView, { style: [...styles, ...style], ...props }, children));
};
export const ScrollView = ({ children, variant = "", style = [], ...props }) => {
    style = style instanceof Array ? style : [style];
    const styles = variantToTheme({ component: "view", styles: variant });
    return (React.createElement(RNScrollView, { style: [...styles, ...style], ...props }, children));
};
//# sourceMappingURL=Containers.js.map