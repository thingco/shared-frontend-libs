import React from "react";
import { View } from "./Containers";
import { Text } from "./Typography";

export const Hint = ({ children }) => {
	return (
		<View
			style={{
				marginTop: 10,
			}}
		>
			<View variant={"flexRow"}>
				<View variant={"hint"}>
					<Text variant={"hintSymbol"}>i</Text>
				</View>
				<Text variant={"hint"}>{children}</Text>
			</View>
		</View>
	);
};

export const ValidationError = ({ children }) => {
	return (
		<View
			style={{
				marginTop: 10,
			}}
		>
			<View variant={"flexRow"}>
				{children && (
					<View variant={"error"}>
						<Text variant={"hintSymbol"}>!</Text>
					</View>
				)}
				<Text variant={"error"}>{children}</Text>
			</View>
		</View>
	);
};
