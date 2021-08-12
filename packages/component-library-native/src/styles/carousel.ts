import { Dimensions } from "react-native";

const { width: viewportWidth, height: viewportHeight } =
	Dimensions.get("window");

export const carouselStyles = (colours, spacing) => ({
	slideInnerContainer: {
		flex: 1,
		width: viewportWidth - 40,
		marginTop: 15,
		paddingHorizontal: 0,
		paddingBottom: 0,
	},
	paginationContainer: {
		flex: -1,
		margin: 0,
		paddingVertical: 0,
	},
	dot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginHorizontal: 4,
		backgroundColor: colours.primary,
	},
	inactiveDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colours.greyscale200,
	},
});
