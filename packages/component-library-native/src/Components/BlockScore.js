import React from "react";
import { View } from "./Containers";
import { Text } from "./Typography";
import { useTheme } from "../Provider/ThemeProvider";
import { ProgressCircle } from "react-native-svg-charts";
import _ from "lodash";
import Up from "../Icons/icon_points_up.svg";
import Down from "../Icons/icon_points_down.svg";
export const BlockScore = ({ score, scored, angle = 0.8, size = 200, textVariant, total = 100, blockChange, from, sinceText, noScoreText, noChangeText, }) => {
    const { theme } = useTheme();
    const textColor = textVariant ? textVariant : "text_appBackground bold";
    const scoreBoundaries = [50, 75]; // TODO: Get this from config?
    const progColor = scored && score < scoreBoundaries[0]
        ? theme.colors?.errorLight
        : scored && score < scoreBoundaries[1]
            ? theme.colors?.errorDark
            : theme.colors?.primary;
    const change = blockChange ? _.round(blockChange, 0) : undefined;
    const showChange = change ? Math.abs(change) : undefined;
    let since;
    if (blockChange && change !== 0 && from) {
        since = (React.createElement(View, { style: { display: "flex", flexDirection: "row" } },
            blockChange > 0 ? (React.createElement(Up, { style: {
                    flex: 0,
                    alignSelf: "center",
                    width: 5,
                    marginRight: 5,
                } })) : (React.createElement(Down, { style: {
                    flex: 0,
                    alignSelf: "center",
                    width: 5,
                    marginRight: 5,
                } })),
            React.createElement(Text, { variant: "xsmall greyscale50" },
                React.createElement(Text, { style: { fontWeight: "bold" } }, showChange),
                " ",
                sinceText,
                " ",
                from)));
    }
    else if (change === 0 && from) {
        since = (React.createElement(Text, { variant: "xsmall greyscale50", style: { textAlign: "center" } },
            React.createElement(Text, { style: { fontWeight: "bold" } }, noChangeText),
            " ",
            "\n",
            sinceText,
            " ",
            from));
    }
    else if (change === 0) {
        since = React.createElement(Text, { variant: "xsmall greyscale50" }, noScoreText);
    }
    return (React.createElement(View, { style: {
            height: size,
            width: size,
        } },
        React.createElement(ProgressCircle, { style: {
                height: size,
                width: size,
                position: "absolute",
            }, progress: score / 100, progressColor: progColor, backgroundColor: theme.colors?.text_appBackground, startAngle: -Math.PI * angle, endAngle: Math.PI * angle, strokeWidth: size / 20 }),
        React.createElement(View, { variant: "centred", style: { flex: 1, zIndex: 2 } },
            scored ? (React.createElement(Text, { variant: textColor },
                React.createElement(Text, { style: [{ fontSize: size / 5, lineHeight: (size / 5) * 1.2 }] }, _.round(score)),
                " ",
                "/ ",
                total)) : (React.createElement(Text, { style: [{ fontSize: size / 5, lineHeight: (size / 5) * 1.2 }], variant: textColor }, "-")),
            since)));
};
export const BlockScoreEmpty = ({ size, angle = 0.8 }) => {
    const { theme } = useTheme();
    return (React.createElement(View, { style: {
            height: size,
            width: size,
        } },
        React.createElement(ProgressCircle, { style: {
                height: size,
                width: size,
                position: "absolute",
            }, progress: 0, progressColor: "transparent", backgroundColor: theme.colors?.text_appBackground, startAngle: -Math.PI * angle, endAngle: Math.PI * angle, strokeWidth: size / 20 }),
        React.createElement(View, { variant: "centred", style: { flex: 1, zIndex: 2 } },
            React.createElement(Text, { variant: "desc greyscale50" }, "Loading..."))));
};
export const BlockScoreNoData = ({ size, angle = 0.8 }) => {
    const { theme } = useTheme();
    return (React.createElement(View, { style: {
            height: size,
            width: size,
        } },
        React.createElement(ProgressCircle, { style: {
                height: size,
                width: size,
                position: "absolute",
            }, progress: 0, progressColor: "transparent", backgroundColor: theme.colors?.text_appBackground, startAngle: -Math.PI * angle, endAngle: Math.PI * angle, strokeWidth: size / 20 }),
        React.createElement(View, { variant: "centred", style: { flex: 1, zIndex: 2 } },
            React.createElement(Text, { variant: "desc greyscale50" }, "No Data Found"))));
};
//# sourceMappingURL=BlockScore.js.map