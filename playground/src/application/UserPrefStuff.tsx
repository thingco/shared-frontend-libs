import { usePrefs, UserPrefsProvider } from "@thingco/user-preferences";
import { createPrefStore } from "@thingco/user-preferences-store-web";
import React from "react";

const store = createPrefStore({ distanceUnitPref: "km", timeDisplayPref: "24" });

const UserPrefs = () => {
	const { prefs, setPref } = usePrefs();

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

			<div></div>
		</section>
	);
};

export const UserPrefStuff = () => (
	<UserPrefsProvider store={store}>
		<UserPrefs />
	</UserPrefsProvider>
);
