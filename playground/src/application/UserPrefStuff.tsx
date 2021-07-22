import { ApplicationConfigProvider, usePreferences } from "@thingco/application-configuration";
import { useFormatter } from "@thingco/data-transformers";
import { createPrefStore } from "@thingco/user-preferences-store-web";
import React from "react";

const store = createPrefStore({
	distanceUnit: "km",
	timeDisplay: "24",
	distanceUnitPrecision: 0,
	locale: "en-GB",
});

const UserPrefs = () => {
	const { prefs, setPref } = usePreferences();
	const { compactDuration, date, dateTime, distance, expandedDuration, averageSpeed, time } =
		useFormatter();

	return (
		<section style={{ backgroundColor: "white", padding: "1rem" }}>
			<h1>Prefs stuff</h1>
			<dl>
				<dt>
					Unit pref{" "}
					<button
						onClick={() => setPref("distanceUnit", prefs.distanceUnit === "km" ? "mi" : "km")}
					>
						change
					</button>
				</dt>
				<dd>{prefs.distanceUnit}</dd>
				<dt>
					Time pref{" "}
					<button onClick={() => setPref("timeDisplay", prefs.timeDisplay === "24" ? "12" : "24")}>
						change
					</button>
				</dt>
				<dd>{prefs.timeDisplay}</dd>
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
	<ApplicationConfigProvider configs={{ distanceUntilScored: 160934 }} store={store}>
		<UserPrefs />
	</ApplicationConfigProvider>
);
