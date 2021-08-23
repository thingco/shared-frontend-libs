import React from "react";
import { Text } from "./Typography";
import { View } from "./Containers";
export const CarouselStatistic = ({ stats, titles = {
    TotalDistance: "",
    TotalDuration: "",
    CompletedTripCount: "",
    PerfectTripCount: "",
    PerfectTripStreak: "",
    TotalEventCount: "",
}, height, }) => {
    const Statistic = ({ value, name }) => {
        return (React.createElement(View, { variant: "flexCol centred", style: {
                flex: 1,
            } },
            React.createElement(Text, { variant: "xlarge greyscale50 centred" }, value),
            React.createElement(Text, { variant: "small greyscale50 centred" }, name)));
    };
    return (React.createElement(View, { variant: "flexCol centred", style: {
            height: height,
        } },
        React.createElement(View, { variant: "flexRow", style: {
                flex: 1,
            } },
            React.createElement(View, { variant: "flexCol centred", style: {
                    flex: 1,
                } },
                React.createElement(Text, { variant: "xxxlarge greyscale50 centred" }, stats.StatTotalDistance),
                React.createElement(Text, { variant: "xxxlarge greyscale50 centred" }, titles.TotalDistance)),
            React.createElement(View, { variant: "flexCol centred", style: {
                    flex: 1,
                } },
                React.createElement(Text, { variant: "xxxlarge greyscale50 centred" }, stats.StatTotalDuration),
                React.createElement(Text, { variant: "xxxlarge greyscale50 centred" }, titles.TotalDuration))),
        React.createElement(View, { variant: "flexRow", style: {
                flex: 1,
            } },
            React.createElement(Statistic, { name: titles.CompletedTripCount, value: stats.StatCompletedTripCount }),
            React.createElement(Statistic, { name: titles.PerfectTripCount, value: stats.StatPerfectTripCount }),
            React.createElement(Statistic, { name: titles.PerfectTripStreak, value: stats.StatPerfectTripStreak }),
            React.createElement(Statistic, { name: titles.TotalEventCount, value: stats.StatTotalEventCount }))));
};
//# sourceMappingURL=CarouselStatistic.js.map