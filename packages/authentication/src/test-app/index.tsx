import { Auth } from "@aws-amplify/auth";
import { inspect } from "@xstate/inspect";
import React from "react";
import ReactDOM from "react-dom";

import { App } from "./App";

Auth.configure({
	region: "eu-west-1",
	userPoolId: "eu-west-1_FrRYZGJO6",
	userPoolWebClientId: "47jbuurvrfafht3em4dvv0qa4d",
	authenticationFlowType: "CUSTOM_AUTH",
});

inspect({
	url: "https://statecharts.io/inspect",
	iframe: false,
});

ReactDOM.render(<App />, document.getElementById("root"));
