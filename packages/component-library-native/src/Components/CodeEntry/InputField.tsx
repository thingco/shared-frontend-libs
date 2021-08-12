import React, { ForwardedRef } from "react";
import { TextInput, View } from "react-native";
import { useTheme } from "../../Provider/ThemeProvider";

export interface InputFieldProps {
	value: string;
	setValue: (value: string) => void;
	isFocus?: boolean;
	size?: number;
	style: "underline" | "box";
	keyboardType: "numeric" | "default";
}

export const InputField = ({
	value,
	setValue,
	isFocus,
	size = 40,
	style,
	keyboardType = "default",
}: InputFieldProps) => {
	const { theme } = useTheme();
	const styles = {
		view: {
			height: size,
			width: size,
			borderColor: isFocus ? theme.colors.primary : theme.colors.secondary,
		},
	};
	return (
		<View
			style={[
				theme.inputs.cell,
				styles.view,
				style === "box" ? theme.inputs.box : theme.inputs.underline,
			]}
		>
			<TextInput
				value={value}
				onChangeText={(e) => setValue(e)}
				maxLength={1}
				style={[theme.inputs.cellText]}
				keyboardType={keyboardType}
			/>
		</View>
	);
};
