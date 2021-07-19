import { UnitFormatterProvider, useFormatter } from "@thingco/unit-formatter";
import { usePrefs, UserPrefsProvider } from "@thingco/user-preferences";
import { createPrefStore } from "@thingco/user-preferences-store-web";
import React from "react";

const store = createPrefStore({
	distanceUnitPref: "km",
	timeDisplayPref: "24",
	distanceUnitPrecisionPref: 0,
	localePref: "en-GB",
});

const UserPrefs = () => {
	const { prefs, setPref } = usePrefs();
	const { compactDuration, date, dateTime, distance, expandedDuration, averageSpeed, time } =
		useFormatter();

	return (
		<section style={{ backgroundColor: "white", padding: "1rem" }}>
			<h1>Prefs stuff</h1>
			<dl>
				<dt>
					Unit pref{" "}
					<button
						onClick={() =>
							setPref("distanceUnitPref", prefs.distanceUnitPref === "km" ? "mi" : "km")
						}
					>
						change
					</button>
				</dt>
				<dd>{prefs.distanceUnitPref}</dd>
				<dt>
					Time pref{" "}
					<button
						onClick={() => setPref("timeDisplayPref", prefs.timeDisplayPref === "24" ? "12" : "24")}
					>
						change
					</button>
				</dt>
				<dd>{prefs.timeDisplayPref}</dd>
			</dl>

			<div>
				<h2>Unit formatting (passing numbers into funcs):</h2>
				<ul style={{ padding: "1rem" }}>
					<li>Average speed: {averageSpeed(4000, 500)}</li>
					<li>Date: {date(1626694284)}</li>
					<li>DateTime: {dateTime(1626694284)}</li>
					<li>Distance: {distance(400000)}</li>
					<li>Duration (compact): {compactDuration(4000)}</li>
					<li>Duration: (expanded): {expandedDuration(4000)}</li>
					<li>Time: {time(1626694284)}</li>
				</ul>

				<h2>Unit formatting (passing strings into funcs):</h2>
				<ul style={{ padding: "1rem" }}>
					<li>Average speed: {averageSpeed("4000", "500")}</li>
					<li>Date: {date("1626694284")}</li>
					<li>DateTime: {dateTime("1626694284")}</li>
					<li>Distance: {distance("400000")}</li>
					<li>Duration (compact): {compactDuration("4000")}</li>
					<li>Duration: (expanded): {expandedDuration("4000")}</li>
					<li>Time: {time("1626694284")}</li>
				</ul>
			</div>
		</section>
	);
};

export const UserPrefStuff = () => (
	<UserPrefsProvider store={store}>
		<UnitFormatterProvider>
			<UserPrefs />
		</UnitFormatterProvider>
	</UserPrefsProvider>
);
