import { Auth } from "@aws-amplify/auth";
import React from "react";
import ReactDOM from "react-dom";

import { App } from "./application/App";

Auth.configure({
	region: "eu-west-1",
	userPoolId: "eu-west-1_ALKzWpcBv",
	userPoolWebClientId: "6puatgps30nq9rf1f3aqoo84t5",
	authenticationFlowType: "USER_PASSWORD_AUTH",
});

// Auth.configure({
// 	region: "eu-west-1",
// 	userPoolId: "eu-west-1_FrRYZGJO6",
// 	userPoolWebClientId: "47jbuurvrfafht3em4dvv0qa4d",
// 	authenticationFlowType: "CUSTOM_AUTH",
// });

ReactDOM.render(<App />, document.getElementById("root"));
