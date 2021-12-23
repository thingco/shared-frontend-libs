import { useTheme } from "../Provider/ThemeProvider";
import React from "react";
import { Pressable, PressableProps, ViewProps } from "react-native";
import { ScrollView, View } from "./Containers";

import { Text } from "./Typography";
import { LineIcon } from "./Icons";

interface MenuListProps extends ViewProps {
	children: React.ReactNode[];
	viewStyle: any;
}

export const MenuList = ({ children, viewStyle }: MenuListProps) => {
	return (
		<ScrollView variant="container" style={{ paddingHorizontal: 0, ...viewStyle }}>
			{children}
		</ScrollView>
	);
};

interface MenuListItemProps extends PressableProps {
	title: string;
	checked?: boolean;
	viewStyle?: any;
	textStyle?: any;
}

export const MenuListItemChecked = ({
	title,
	checked = false,
	onPress,
	viewStyle,
	textStyle,
}: MenuListItemProps) => {
	const { theme } = useTheme();
	return (
		<Pressable
			onPress={onPress}
			style={{
				flexDirection: "row",
				alignItems: "center",
				flex: 1,
				padding: 20,
				backgroundColor: checked ? theme.colors?.primary?.toString() : "transparent",
				...viewStyle,
			}}
		>
			<Text
				variant="body"
				style={{
					flex: 1,
					color: checked
						? theme.colors?.text_primary?.toString()
						: theme.colors?.text_appBackground?.toString(),
					...textStyle,
				}}
			>
				{title}
			</Text>
			<View
				style={{
					flex: 0,
					justifyContent: "center",
					alignContent: "center",
				}}
			>
				{checked && (
					<LineIcon
						iconType="tick"
						size={25}
						stroke={theme.colors?.text_primary?.toString()}
						strokeWidth={4}
						style={{ marginRight: 5 }}
					/>
				)}
			</View>
		</Pressable>
	);
};

export const MenuListItemRow = ({ title, onPress, style }: MenuListItemProps) => {
	const { theme } = useTheme();
	const [highlight, setHighlight] = React.useState(false);
	return (
		<Pressable
			onPress={onPress}
			onTouchStart={() => setHighlight(true)}
			onTouchEnd={() => setHighlight(false)}
			style={{
				flexDirection: "row",
				alignItems: "center",
				flex: 1,
				padding: 20,
				backgroundColor: highlight ? theme.colors?.primary?.toString() : "transparent",
			}}
			{...style}
		>
			<Text variant="body" style={{ flex: 1, color: theme.colors?.text_appBackground }}>
				{title}
			</Text>
			<View
				style={{
					flex: 0,
					justifyContent: "center",
					alignContent: "center",
				}}
			>
				<LineIcon
					iconType="forward"
					size={25}
					stroke={theme.colors?.text_primary?.toString()}
					strokeWidth={4}
					style={{ marginRight: 5 }}
				/>
			</View>
		</Pressable>
	);
};
