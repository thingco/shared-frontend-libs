import { Auth } from "@aws-amplify/auth";
import { inspect } from "@xstate/inspect";
import React from "react";
import ReactDOM from "react-dom";

import { App } from "./App";

Auth.configure({
	region: "eu-west-1",
	userPoolId: "eu-west-1_ALKzWpcBv",
	userPoolWebClientId: "141rcrvnpc2vktj9mbjrmok0l4",
	authenticationFlowType: "CUSTOM_AUTH",
});

console.log(Auth.configure());

inspect({
	url: "https://statecharts.io/inspect",
	iframe: false,
});

ReactDOM.render(<App />, document.getElementById("root"));
