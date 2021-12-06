import { useSubmittingForceChangePassword } from "@thingco/authentication-react";
import React from "react";
import { SubmittingForceChangePasswordUi } from "test-app/stages";
import uiText from "test-app/ui-copy";
import { validateForceChangePasswordCb } from "./callback-implementations";
import { clickButton, fillInput } from "./event-factories";

const {
	authStages: {
		submittingForceChangePassword: { controlLabels },
	},
} = uiText;

export const SubmittingForceChangePassword = () => {
	const { error, isLoading, isActive, validateNewPassword } =
		useSubmittingForceChangePassword(validateForceChangePasswordCb);

	return (
		<SubmittingForceChangePasswordUi
			error={error}
			isLoading={isLoading}
			isActive={isActive}
			validateNewPassword={validateNewPassword}
		/>
	);
};

export const SubmittingForceChangePasswordEvents = {
	fillPasswordInput: fillInput(controlLabels.newPasswordInput),
	clickSubmit: clickButton(controlLabels.submitPassword),
};
