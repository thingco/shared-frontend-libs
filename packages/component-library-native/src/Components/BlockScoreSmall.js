import React from "react";
import { View } from "./Containers";
import { Text } from "./Typography";
import { useTheme } from "../Provider/ThemeProvider";
import { ProgressCircle } from "react-native-svg-charts";
export const BlockScoreSmall = ({ score, scored, angle = 0.8, size = 70 }) => {
    const { theme } = useTheme();
    const scoreBoundaries = [50, 75]; // TODO: Get this from config?
    const progColor = scored && score < scoreBoundaries[0]
        ? theme.colors?.errorLight
        : scored && score < scoreBoundaries[1]
            ? theme.colors?.errorDark
            : theme.colors?.primary;
    return (React.createElement(View, { style: {
            marginTop: 8,
            marginLeft: -5,
            height: size,
            width: size,
        } },
        React.createElement(ProgressCircle, { style: {
                height: size,
                width: size,
                position: "absolute",
            }, progress: score / 100, progressColor: progColor, backgroundColor: theme.colors?.greyscale100, startAngle: -Math.PI * angle, endAngle: Math.PI * angle }),
        React.createElement(View, { variant: "centred", style: { flex: 1 } }, scored ? (React.createElement(Text, { style: [{ fontSize: size / 3, lineHeight: (size / 3) * 1.2 }], variant: "desc bold text_background" }, score)) : (React.createElement(Text, { style: [{ fontSize: size / 3, lineHeight: (size / 3) * 1.2 }], variant: "desc bold text_background" }, "-")))));
};
//# sourceMappingURL=BlockScoreSmall.js.map