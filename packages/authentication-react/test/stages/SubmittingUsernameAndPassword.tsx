import { useSubmittingUsernameAndPassword } from "@thingco/authentication-react";
import { SubmittingUsernameAndPasswordUi } from "test-app/stages";
import React from "react";
import uiText from "test-app/ui-copy";
import { validateUsernameAndPasswordCb } from "./callback-implementations";
import { fillInput, clickButton } from "./event-factories";


const {
	authStages: {
		submittingUsernameAndPassword: { controlLabels },
	},
} = uiText;


export const SubmittingUsernameAndPassword = () => {
	const {
		error,
		isActive,
		isLoading,
		validateUsernameAndPassword,
		forgottenPassword,
	} = useSubmittingUsernameAndPassword(validateUsernameAndPasswordCb);

	return (
		<SubmittingUsernameAndPasswordUi
			error={error}
			isLoading={isLoading}
			isActive={isActive}
			validateUsernameAndPassword={validateUsernameAndPassword}
			forgottenPassword={forgottenPassword}
		/>
	);
};

export const SubmittingUsernameAndPasswordEvents = {
	fillUsernameInput: fillInput(controlLabels.usernameInput),
	fillPasswordInput: fillInput(controlLabels.passwordInput),
	clickSubmit: clickButton(controlLabels.logIn),
	clickForgotPassword: clickButton(controlLabels.forgotPassword),
};
