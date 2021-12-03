import React from "react";
import { useAuthenticated, useAuthProvider } from "@thingco/authentication-react";
import { AuthenticatedUi } from "test-app/stages";
import uiText from "test-app/ui-copy";
import { clickButton } from "./event-factories";

const {
	authStages: {
		authenticated: { controlLabels },
	},
} = uiText;


export const Authenticated = () => {
	const { isActive, requestLogOut, requestPasswordChange, requestPinChange } = useAuthenticated();
	const { deviceSecurityType, loginFlowType } = useAuthProvider();

	return (
		<AuthenticatedUi
			isActive={isActive}
			requestLogOut={requestLogOut}
			requestPasswordChange={requestPasswordChange}
			requestPinChange={requestPinChange}
			deviceSecurityType={deviceSecurityType}
			loginFlowType={loginFlowType}
		/>
	)
};

export const AuthenticatedEvents = {
	clickRequestLogOut: clickButton(controlLabels.logOut),
	clickRequestPasswordChange: clickButton(controlLabels.changePassword),
	clickRequestPinChange: clickButton(controlLabels.changePin),
};
