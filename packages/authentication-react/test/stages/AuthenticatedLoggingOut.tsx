import React from "react";
import { AuthenticatedLoggingOutUi } from "test-app/stages";
import { useAuthenticatedLoggingOut } from "@thingco/authentication-react";
import uiText from "test-app/ui-copy";
import { logoutCb } from "./callback-implementations";
import { clickButton } from "./event-factories";


const {
	authStages: {
		authenticatedLoggingOut: { controlLabels },
	},
} = uiText;


export const AuthenticatedLoggingOut = () => {
	const { error, isActive, isLoading, logOut, cancelLogOut } = useAuthenticatedLoggingOut(logoutCb);

	return (
		<AuthenticatedLoggingOutUi
			error={error}
			isActive={isActive}
			isLoading={isLoading}
			logOut={logOut}
			cancelLogOut={cancelLogOut}
		/>
	);
};

export const AuthenticatedLoggingOutEvents = {
	clickConfirmLogOut: clickButton(controlLabels.logOut),
	clickCancelLogOut: clickButton(controlLabels.cancelLogOut),
};
