import React, { useState } from "react";
import { View } from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";
import { useTheme } from "../Provider/ThemeProvider";
export const AppCarousel = ({ items = [], height, width, scrollEnabled = true, ...props }) => {
    const [activeSlide, setActiveSlide] = useState(0);
    const { theme } = useTheme();
    const sliderWidth = width - 40;
    const itemWidth = width - 40;
    return (React.createElement(View, { style: { height: height } },
        React.createElement(Carousel, { data: items, renderItem: ({ item, index }) => item, sliderWidth: sliderWidth, itemWidth: itemWidth, onSnapToItem: (index) => setActiveSlide(index), inactiveSlideScale: 1, scrollEnabled: scrollEnabled, ...props }),
        React.createElement(Pagination, { dotsLength: items.length, activeDotIndex: activeSlide, containerStyle: theme.carousel?.paginationContainer, dotStyle: theme.carousel?.dot, inactiveDotStyle: theme.carousel?.inactiveDot, inactiveDotOpacity: 0.6, inactiveDotScale: 0.8 })));
};
export const QuestionCarousel = ({ items = [], width, scrollEnabled = true, ...props }) => {
    const [activeSlide, setActiveSlide] = useState(0);
    const { theme } = useTheme();
    return (React.createElement(View, { style: { height: "100%", width: "100%" } },
        React.createElement(Carousel, { data: items, renderItem: ({ item, index }) => item, sliderWidth: width, itemWidth: width, slideStyle: { width: width }, onSnapToItem: (index) => setActiveSlide(index), inactiveSlideScale: 1, scrollEnabled: scrollEnabled, ...props }),
        React.createElement(Pagination, { dotsLength: items.length, activeDotIndex: activeSlide, containerStyle: { height: 120 }, dotStyle: theme.carousel?.dot, inactiveDotStyle: theme.carousel?.inactiveDot, inactiveDotOpacity: 0.6, inactiveDotScale: 0.8 })));
};
//# sourceMappingURL=Carousel.js.map