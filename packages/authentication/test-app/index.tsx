import React from "react";
import ReactDOM from "react-dom";
import { inspect } from "@xstate/inspect";

import { App } from "./App";

const appRoot = document.getElementById("root");

inspect({
	url: "https://statecharts.io/inspect",
	iframe: false,
});

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	appRoot
);
