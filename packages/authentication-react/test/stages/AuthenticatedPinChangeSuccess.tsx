import React from "react";
import { AuthenticatedPinChangeSuccessUi } from "test-app/stages";
import { useAuthenticatedPinChangeSuccess } from "@thingco/authentication-react";
import uiText from "test-app/ui-copy";
import { clickButton } from "./event-factories"


const {
	authStages: {
		authenticatedPinChangeSuccess: { controlLabels },
	},
} = uiText;


export const AuthenticatedPinChangeSuccess = () => {
	const { isActive, confirmPinChange } = useAuthenticatedPinChangeSuccess();

	return (
		<AuthenticatedPinChangeSuccessUi
			isActive={isActive}
			confirmPinChange={confirmPinChange}
		/>
	);
};

export const AuthenticatedPinChangeSuccessEvents = {
	clickConfirm: clickButton(controlLabels.confirm),
};
