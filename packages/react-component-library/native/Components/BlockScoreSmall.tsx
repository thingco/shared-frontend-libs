import React from "react";
import { View } from "./Containers";
import { Text } from "./Typography";
import { useTheme } from "../Provider/ThemeProvider";
import { ProgressCircle } from "react-native-svg-charts";

interface BlockScoreProps {
	score: number;
	scored: boolean;
	angle?: number;
	size?: number;
}
export const BlockScoreSmall = ({
	score,
	scored,
	angle = 0.8,
	size = 70,
}: BlockScoreProps) => {
	const { theme } = useTheme();
	const spacing = theme.spacing;

	const scoreBoundaries = [50, 75]; // TODO: Get this from config?

	const progColor =
		scored && score < scoreBoundaries[0]
			? theme.colors.errorLight
			: scored && score < scoreBoundaries[1]
			? theme.colors.errorDark
			: theme.colors.primary;

	return (
		<View
			style={{
				marginTop: 8,
				marginLeft: -5,
				height: size,
				width: size,
			}}
		>
			<ProgressCircle
				style={{
					height: size,
					width: size,
					position: "absolute",
				}}
				progress={score / 100}
				progressColor={progColor}
				backgroundColor={theme.colors.greyscale100}
				startAngle={-Math.PI * angle}
				endAngle={Math.PI * angle}
			/>
			<View variant="centred" style={{ flex: 1 }}>
				{scored ? (
					<Text
						style={[{ fontSize: size / 3, lineHeight: (size / 3) * 1.2 }]}
						variant="desc bold text_background"
					>
						{score}
					</Text>
				) : (
					<Text
						style={[{ fontSize: size / 3, lineHeight: (size / 3) * 1.2 }]}
						variant="desc bold text_background"
					>
						-
					</Text>
				)}
			</View>
		</View>
	);
};
