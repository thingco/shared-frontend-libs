import React from "react";
import { AuthenticatedPasswordChangeSuccessUi } from "test-app/stages";
import { useAuthenticatedPasswordChangeSuccess } from "@thingco/authentication-react";
import uiText from "test-app/ui-copy";
import { clickButton } from "./event-factories";


const {
	authStages: {
		authenticatedPasswordChangeSuccess: { controlLabels },
	},
} = uiText;


export const AuthenticatedPasswordChangeSuccess = () => {
	const { isActive, confirmPasswordChange } = useAuthenticatedPasswordChangeSuccess();

	return (
		<AuthenticatedPasswordChangeSuccessUi
			isActive={isActive}
			confirmPasswordChange={confirmPasswordChange}
		/>
	)
};

export const AuthenticatedPasswordChangeSuccessEvents = {
	clickConfirm: clickButton(controlLabels.confirm),
};
