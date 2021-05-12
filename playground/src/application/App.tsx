import { ThemeProvider } from "@thingco/react-component-library";
import React from "react";

import { AuthStuff } from "./AuthStuff";
import { GraphStuff } from "./GraphStuff";
import { UserPrefStuff } from "./UserPrefStuff";

export const App = (): JSX.Element => (
	<ThemeProvider theme={{}}>
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
			<AuthStuff />
			<UserPrefStuff />
			<GraphStuff />
		</div>
	</ThemeProvider>
);
