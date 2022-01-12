import React from "react";

import { Text, TextProps } from "./Text";

export const validateScore = (score: number): number => {
	if (!Number.isInteger(score) || score < 0 || score > 100) {
		throw new Error(
			`Invalid score passed in: ${JSON.stringify(
				score
			)}. Score must be a number between 0 and 100 inclusive.`
		);
	}
	return score;
};

export interface ScoreProps extends TextProps {
	score: number;
	variant?: "score" | "scorePercentage";
}

export const Score = ({ score, variant = "score", sx = {} }: ScoreProps): JSX.Element => {
	const validScore = validateScore(score);
	return (
		<Text as="h3" variant={variant} sx={sx}>
			{validScore}
		</Text>
	);
};
