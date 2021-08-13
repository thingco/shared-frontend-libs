import React from "react";

import { Text } from "./Typography";
import { View } from "./Containers";
interface Stats {
	StatTotalDistance: string;
	StatTotalDuration: string;
	StatCompletedTripCount: number;
	StatPerfectTripCount: number;
	StatPerfectTripStreak: number;
	StatTotalEventCount: number;
}

interface Titles {
	TotalDistance: string;
	TotalDuration: string;
	CompletedTripCount: string;
	PerfectTripCount: string;
	PerfectTripStreak: string;
	TotalEventCount: string;
}

interface CarouselStatisticsProps {
	stats: Stats;
	titles: Titles;
	height: number;
}

interface StatisticProps {
	value: number;
	name: string;
}

export const CarouselStatistic = ({
	stats,
	titles = {
		TotalDistance: "",
		TotalDuration: "",
		CompletedTripCount: "",
		PerfectTripCount: "",
		PerfectTripStreak: "",
		TotalEventCount: "",
	},
	height,
}: CarouselStatisticsProps) => {
	const Statistic = ({ value, name }: StatisticProps) => {
		return (
			<View
				variant={"flexCol centred"}
				style={{
					flex: 1,
				}}
			>
				<Text variant={"xlarge greyscale50 centred"}>{value}</Text>
				<Text variant={"small greyscale50 centred"}>{name}</Text>
			</View>
		);
	};

	return (
		<View
			variant={"flexCol centred"}
			style={{
				height: height,
			}}
		>
			<View
				variant={"flexRow"}
				style={{
					flex: 1,
				}}
			>
				<View
					variant={"flexCol centred"}
					style={{
						flex: 1,
					}}
				>
					<Text variant={"xxxlarge greyscale50 centred"}>{stats.StatTotalDistance}</Text>
					<Text variant={"xxxlarge greyscale50 centred"}>{titles.TotalDistance}</Text>
				</View>
				<View
					variant={"flexCol centred"}
					style={{
						flex: 1,
					}}
				>
					<Text variant={"xxxlarge greyscale50 centred"}>{stats.StatTotalDuration}</Text>
					<Text variant={"xxxlarge greyscale50 centred"}>{titles.TotalDuration}</Text>
				</View>
			</View>
			<View
				variant={"flexRow"}
				style={{
					flex: 1,
				}}
			>
				<Statistic name={titles.CompletedTripCount} value={stats.StatCompletedTripCount} />
				<Statistic name={titles.PerfectTripCount} value={stats.StatPerfectTripCount} />
				<Statistic name={titles.PerfectTripStreak} value={stats.StatPerfectTripStreak} />
				<Statistic name={titles.TotalEventCount} value={stats.StatTotalEventCount} />
			</View>
		</View>
	);
};
