import I18n from "i18n-js";
import React from "react";
import { ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
import { useTheme } from "../Provider/ThemeProvider";
import { View } from "./Containers";
import { Text } from "./Typography";
import Warning from "./icon_warning.svg";
const { width: viewportWidth } = Dimensions.get("window");
const tileWidth = viewportWidth - 40;
export const CarouselEvent = ({ item, index, height, onPress }) => {
    let event;
    let icon;
    let details;
    if (item.type === "summary") {
        details = (React.createElement(View, { variant: "flexRow", style: {
                flex: 2,
            } },
            React.createElement(View, { variant: "centred", style: {
                    flex: 1,
                    justifyContent: "flex-end",
                } },
                React.createElement(Text, { variant: "accent" }, I18n.t("Distance")),
                React.createElement(Text, null,
                    React.createElement(Text, { style: { fontWeight: "bold" } }, item.distance),
                    " ")),
            React.createElement(View, { variant: "centred", style: {
                    flex: 1,
                    justifyContent: "flex-end",
                } },
                React.createElement(Text, { variant: "accent" }, I18n.t("Duration")),
                React.createElement(Text, { style: { fontWeight: "bold" } }, item.duration)),
            React.createElement(View, { variant: "centred", style: {
                    flex: 1,
                    justifyContent: "flex-end",
                } },
                React.createElement(Text, { variant: "accent" }, I18n.t("Avg Speed")),
                React.createElement(Text, null,
                    React.createElement(Text, { style: { fontWeight: "bold" } }, item.avgspeed),
                    " "))));
        return (React.createElement(TouchableOpacity, { activeOpacity: 1, style: {
                flex: 1,
                width: tileWidth,
                paddingTop: 18,
                paddingBottom: 18, // needed for shadow,
            }, onPress: (e) => onPress(e) },
            React.createElement(View, { variant: "card", style: { minHeight: height } },
                React.createElement(View, { style: { marginTop: 6, marginBottom: 6 } },
                    React.createElement(Text, { variant: "base bold text_background", style: { letterSpacing: 0.5 } }, item.title)),
                React.createElement(View, { style: {
                        flex: 2,
                        marginTop: 2,
                        borderTopWidth: 1,
                        borderTopColor: "#dddddd",
                    } },
                    React.createElement(Text, { variant: "base text_background", style: { marginTop: 6 } }, item.description),
                    details))));
    }
    else {
        event = (React.createElement(Text, { variant: "base greyscale_600", style: { fontStyle: "italic" } },
            item.location,
            " at ",
            item.time));
        icon = React.createElement(Warning, { style: { marginRight: 10 } });
        return (React.createElement(TouchableOpacity, { activeOpacity: 1, style: {
                flex: 1,
                width: tileWidth,
                paddingTop: 18,
                paddingBottom: 18, // needed for shadow
            }, onPress: (e) => onPress(e) },
            React.createElement(View, { variant: "card", style: { minHeight: height } },
                React.createElement(View, { style: { flex: 1, display: "flex", flexDirection: "row" } },
                    icon,
                    React.createElement(View, { style: { flex: 3 } },
                        React.createElement(Text, { variant: "base bold text_background", style: { letterSpacing: 0.5 } }, item.title),
                        event)),
                React.createElement(View, { style: {
                        flex: 2,
                        borderTopWidth: 1,
                        borderTopColor: "#dddddd",
                    } },
                    React.createElement(Text, { variant: "base text_background", style: { marginTop: 6 } }, item.description),
                    details))));
    }
};
export const CarouselEventEmpty = ({ height }) => {
    const { theme } = useTheme();
    return (React.createElement(View, { variant: "card centred", style: { minHeight: height, marginHorizontal: 20, marginBottom: 10 } },
        React.createElement(ActivityIndicator, { size: "large", color: theme.colors?.primary })));
};
//# sourceMappingURL=CarouselEvent.js.map