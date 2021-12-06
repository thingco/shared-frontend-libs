import { useAuthenticatedChangingPassword } from "@thingco/authentication-react";
import React from "react";
import { AuthenticatedChangingPasswordUi } from "test-app/stages";
import uiText from "test-app/ui-copy";
import { changePasswordCb } from "./callback-implementations";
import { clickButton, fillInput } from "./event-factories";


const {
	authStages: {
		authenticatedChangingPassword: { controlLabels },
	},
} = uiText;


export const AuthenticatedChangingPassword = () => {
	const { error, isActive, isLoading, submitNewPassword, cancelChangePassword } =
		useAuthenticatedChangingPassword(changePasswordCb);

	return (
		<AuthenticatedChangingPasswordUi
			error={error}
			isActive={isActive}
			isLoading={isLoading}
			cancelChangePassword={cancelChangePassword}
			submitNewPassword={submitNewPassword}
		/>
	);
};

export const AuthenticatedChangingPasswordEvents = {
	fillCurrentPasswordInput: fillInput(controlLabels.currentPasswordInput),
	fillNewPasswordInput: fillInput(controlLabels.newPasswordInput),
	clickSubmit: clickButton(controlLabels.changePassword),
	clickCancel: clickButton(controlLabels.cancelChangePassword),
}
