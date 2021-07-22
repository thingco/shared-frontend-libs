import React from "react";

import { AuthStuff } from "./AuthStuff";
import { UserPrefStuff } from "./UserPrefStuff";

// import { GraphStuff } from "./_GraphStuff.text";
export const App = (): JSX.Element => (
	<div
		style={{
			backgroundColor: "#bdc3c7",
			minHeight: "100vh",
			display: "grid",
			gridTemplateColumns: "100%",
			gridTemplateRows: "min-content auto",
			padding: "1rem",
			gap: "1rem",
		}}
	>
		{/* <GraphStuff /> */}
		<AuthStuff />
		<UserPrefStuff />
	</div>
);
