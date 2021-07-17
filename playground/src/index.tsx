import { Auth as AWSAuth } from "@aws-amplify/auth";
import React from "react";
import ReactDOM from "react-dom";

import { App } from "./application/App";

AWSAuth.configure({
	region: "eu-west-1",
	userPoolId: "eu-west-1_FrRYZGJO6",
	userPoolWebClientId: "47jbuurvrfafht3em4dvv0qa4d",
	authenticationFlowType: "CUSTOM_AUTH",
});

ReactDOM.render(<App />, document.getElementById("root"));
