import React from "react";
import shortid from "shortid";
import { Flex, Text, ThemeUIStyleObject } from "theme-ui";

export interface ToggleButtonProps {
	buttonLabels: string[];
	onClick: (index: number) => void;
	buttonStyle?: ThemeUIStyleObject;
	containerStyle?: ThemeUIStyleObject;
	labelStyle?: ThemeUIStyleObject;
}

export const ToggleButton = ({
	buttonLabels,
	onClick,
	buttonStyle = {},
	containerStyle = {},
	labelStyle = {},
}: ToggleButtonProps): JSX.Element => {
	const [selected, setSelected] = React.useState(0);
	return (
		<Flex
			sx={{
				...containerStyle,
				minHeight: "40px",
				border: "1px solid",
				borderColor: "secondary",
			}}
		>
			{buttonLabels.map((text, index) => (
				<Flex
					key={shortid.generate()}
					data-testid={`${text}Button`}
					sx={{
						...buttonStyle,
						height: "40px",
						alignItems: "center",
						padding: "base",
						"&:hover, &:focus": {
							backgroundColor: "accent",
							color: "background",
						},
						cursor: selected === index ? "auto" : "pointer",
						backgroundColor: selected === index ? "accent" : "background",
						color: selected === index ? "background" : "secondary",
						borderRight: index === buttonLabels.length - 1 ? "0" : "1px solid",
						borderColor: "secondary",
					}}
					onClick={() => {
						onClick(index);
						setSelected(index);
					}}
				>
					<Text
						sx={{
							...labelStyle,
							textAlign: "center",
						}}
					>
						{text}
					</Text>
				</Flex>
			))}
		</Flex>
	);
};
