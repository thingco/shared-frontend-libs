import React from "react";
import { Dimensions } from "react-native";
import { Text } from "./Typography";
import Svg, { Line } from "react-native-svg";
import { useTheme } from "../Provider/ThemeProvider";
import { View } from "./Containers";
const { width: viewportWidth } = Dimensions.get("window");
export const BlockProgress = ({ text, progressPercentage, strokeWidth = 7, margin = 50, }) => {
    const { theme } = useTheme();
    const value = 3 + progressPercentage * 97;
    const width = (viewportWidth - margin) * (value / 100);
    return (React.createElement(View, { style: {
            paddingVertical: 20,
        } },
        React.createElement(Text, { variant: "base greyscale50 centred" },
            React.createElement(Text, { variant: "bold" }, text)),
        React.createElement(Svg, { width: viewportWidth - 20, height: "20" },
            React.createElement(Line, { x1: "5", y1: "10", x2: viewportWidth - margin, y2: "10", stroke: theme.colors?.text_appBackground, strokeWidth: strokeWidth, strokeLinecap: "round" }),
            React.createElement(Line, { x1: "5", y1: "10", x2: width, y2: "10", stroke: theme.colors?.primary, strokeWidth: strokeWidth, strokeLinecap: "round" }))));
};
export const BlockProgressLoading = () => {
    const { theme } = useTheme();
    const strokeWidth = 7;
    const margin = 50;
    const width = viewportWidth - margin;
    return (React.createElement(View, { style: {
            flex: 1,
            paddingVertical: 20,
        } },
        React.createElement(Svg, { width: viewportWidth - 20, height: "20" },
            React.createElement(Line, { x1: "5", y1: "10", x2: width, y2: "10", stroke: theme.colors?.text_appBackground, strokeWidth: strokeWidth, strokeLinecap: "round" }),
            React.createElement(Line, { x1: "5", y1: "10", x2: 0, y2: "10", stroke: theme.colors?.text_appBackground, strokeWidth: strokeWidth, strokeLinecap: "round" }))));
};
//# sourceMappingURL=BlockProgress.js.map