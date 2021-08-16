import React, { useState } from "react";
import { TextStyle, View, ViewStyle } from "react-native";
import Carousel, { Pagination } from "react-native-snap-carousel";

import { useTheme } from "../Provider/ThemeProvider";

interface CarouselProps {
	variant?: string;
	items: any[];
	height: number;
	width: number;
	style?: ViewStyle[] | ViewStyle;
	textStyle?: TextStyle[] | TextStyle;
	scrollEnabled?: boolean;
}

export const AppCarousel = ({
	items = [],
	height,
	width,
	scrollEnabled = true,
	...props
}: CarouselProps) => {
	const [activeSlide, setActiveSlide] = useState(0);
	const { theme } = useTheme();

	const sliderWidth = width - 40;
	const itemWidth = width - 40;

	return (
		<View style={{ height: height }}>
			<Carousel
				data={items}
				renderItem={({ item, index }: { item: any; index: any }) => item}
				sliderWidth={sliderWidth}
				itemWidth={itemWidth}
				onSnapToItem={(index) => setActiveSlide(index)}
				inactiveSlideScale={1}
				scrollEnabled={scrollEnabled}
				{...props}
			/>
			<Pagination
				dotsLength={items.length}
				activeDotIndex={activeSlide}
				containerStyle={theme.carousel?.paginationContainer}
				dotStyle={theme.carousel?.dot}
				inactiveDotStyle={theme.carousel?.inactiveDot}
				inactiveDotOpacity={0.6}
				inactiveDotScale={0.8}
			/>
		</View>
	);
};

export const QuestionCarousel = ({
	items = [],
	width,
	scrollEnabled = true,
	...props
}: CarouselProps) => {
	const [activeSlide, setActiveSlide] = useState(0);
	const { theme } = useTheme();

	return (
		<View style={{ height: "100%", width: "100%" }}>
			<Carousel
				data={items}
				renderItem={({ item, index }: { item: any; index: any }) => item}
				sliderWidth={width}
				itemWidth={width}
				slideStyle={{ width: width }}
				onSnapToItem={(index) => setActiveSlide(index)}
				inactiveSlideScale={1}
				scrollEnabled={scrollEnabled}
				{...props}
			/>
			<Pagination
				dotsLength={items.length}
				activeDotIndex={activeSlide}
				containerStyle={{ height: 120 }}
				dotStyle={theme.carousel?.dot}
				inactiveDotStyle={theme.carousel?.inactiveDot}
				inactiveDotOpacity={0.6}
				inactiveDotScale={0.8}
			/>
		</View>
	);
};
