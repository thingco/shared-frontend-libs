import React from "react";
import shortid from "shortid";
import { Flex, Grid, GridProps, ThemeUIStyleObject } from "theme-ui";

import { Details, DetailsProps } from "./Details";
import { LineIcon } from "./LineIcon";
import { Score } from "./Score";
import { Text } from "./Text";

interface ScoresMapItem {
	scoreType: string;
	config: number[];
	score: number;
	scoreTypeDescription?: string;
}

type ScoresMap = ScoresMapItem[];

interface ScoresListItemProps extends DetailsProps {
	score: number;
	scoreType: string;
	scoreTypeDescription?: string;
	config: number[];
	sx?: ThemeUIStyleObject;
}

const ScoresListItem = ({
	score,
	scoreType,
	scoreTypeDescription,
	config,
	sx = {},
}: ScoresListItemProps) => {
	const stars: React.ReactNode[] = [];

	config.map((limit) =>
		score > limit
			? stars.push(
					<LineIcon
						key={shortid.generate()}
						iconType="star_full"
						size="2rem"
						stroke="hsl(220, 65%, 51%)"
					/>
			  )
			: stars.push(
					<LineIcon
						key={shortid.generate()}
						iconType="star_empty"
						size="2rem"
						stroke="hsl(220, 65%, 51%)"
					/>
			  )
	);

	return (
		<Details>
			<Details.Summary
				sx={{
					display: "grid",
					gap: "xsmall",
					gridTemplateColumns: "4fr 1fr",
					alignItems: "center",
					justifyContent: "start",
					p: "base",
					...sx,
				}}
			>
				<Flex sx={{ flexDirection: "column" }}>
					<Text>{scoreType}</Text>
					<Flex>{stars}</Flex>
				</Flex>
				<Score
					variant="scorePercentage"
					score={score}
					sx={{ flex: 1, textAlign: "right", pr: "base" }}
				/>
			</Details.Summary>
			<Text variant="smallMuted" sx={{ p: "base" }}>
				{scoreTypeDescription}
			</Text>
		</Details>
	);
};

interface ScoresListProps extends GridProps {
	scoresMap: ScoresMap;
	sx?: ThemeUIStyleObject;
}

/**
 * A list of a user's scores for each category of score. Each one shows
 * the name of that category and the score, and on click expands to show
 * a description of how the scoring works.
 *
 * @param root0
 * @param root0.scoresMap
 * @param root0.sx
 */
export const ScoresList = ({ scoresMap, sx = {} }: ScoresListProps): JSX.Element => (
	<Grid
		as="ul"
		sx={{
			bg: "transparent",
			gridTemplateColumns: "100%",
			alignItems: "stretch",
			gridAutoRows: "min-content",
			gap: "1px",
			width: "100%",
			...sx,
		}}
	>
		{scoresMap.map(({ score, config, scoreType, scoreTypeDescription }) => (
			<ScoresListItem
				key={shortid.generate()}
				score={score}
				config={config}
				scoreType={scoreType}
				scoreTypeDescription={scoreTypeDescription}
			/>
		))}
	</Grid>
);
