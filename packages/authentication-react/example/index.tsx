import React, { StrictMode } from "react";
import { render } from "react-dom";
import { inspect } from "@xstate/inspect";

import { App } from "./App";

const appRoot = globalThis.document.getElementById("root");

inspect({
	url: "https://statecharts.io/inspect",
	iframe: false,
});

render(
	<StrictMode>
		<App />
	</StrictMode>,
	appRoot
);
