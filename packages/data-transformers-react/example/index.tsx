import React, { StrictMode } from "react";
import { render } from "react-dom";

import { App } from "./App";

const appRoot = globalThis.document.getElementById("root");

render(
	<StrictMode>
		<App />
	</StrictMode>,
	appRoot
);
