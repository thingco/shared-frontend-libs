import React from "react";
import I18n from "../../app/I18n";

import { Text } from "./Typography";
import { View } from "./Containers";

import { distance, duration } from "@thingco/unit-formatter";
import { usePrefs } from "@thingco/user-preferences";
interface Stats {
	StatTotalDistance: number;
	StatTotalDuration: number;
	StatCompletedTripCount: number;
	StatPerfectTripCount: number;
	StatPerfectTripStreak: number;
	StatTotalEventCount: number;
}

interface CarouselStatisticsProps {
	stats: Stats;
	height: number;
}

export const CarouselStatistic = ({ stats, height }: CarouselStatisticsProps) => {
	const { prefs } = usePrefs();

	const dist = distance({
		unitPreference: prefs.distanceUnitPref,
		precision: prefs.distanceUnitPrecisionPref,
	});
	const dur = duration({ locale: prefs.localePref });

	const Statistic = ({ value, name }) => {
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
					<Text variant={"xxxlarge greyscale50 centred"}>{dist(stats.StatTotalDistance)}</Text>
					<Text variant={"xxxlarge greyscale50 centred"}>{I18n.t("totalDistance")}</Text>
				</View>
				<View
					variant={"flexCol centred"}
					style={{
						flex: 1,
					}}
				>
					<Text variant={"xxxlarge greyscale50 centred"}>{dur(stats.StatTotalDuration)}</Text>
					<Text variant={"xxxlarge greyscale50 centred"}>{I18n.t("totalDuration")}</Text>
				</View>
			</View>
			<View
				variant={"flexRow"}
				style={{
					flex: 1,
				}}
			>
				<Statistic name={I18n.t("completedCount")} value={stats.StatCompletedTripCount} />
				<Statistic name={I18n.t("perfectCount")} value={stats.StatPerfectTripCount} />
				<Statistic name={I18n.t("perfectStreak")} value={stats.StatPerfectTripStreak} />
				<Statistic name={I18n.t("totalEventCount")} value={stats.StatTotalEventCount} />
			</View>
		</View>
	);
};
