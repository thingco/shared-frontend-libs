import React from "react";
import { CheckingSessionUi } from "test-app/stages";
import { useCheckingSession } from "@thingco/authentication-react";
import uiText from "test-app/ui-copy";
import { checkSessionCb } from "./callback-implementations";
import { clickButton } from "./event-factories";


const {
	authStages: {
		checkingForSession: { controlLabels },
	},
} = uiText;

export const CheckingSession = () => {
	const { isActive, isLoading, checkSession, error } = useCheckingSession(checkSessionCb);

	return (
		<CheckingSessionUi
			isActive={isActive}
			isLoading={isLoading}
			checkSession={checkSession}
			error={error}
		/>
	);
};

export const CheckingSessionEvents = {
	clickCheckSession: clickButton(controlLabels.checkForExistingSession),
};
