import { useForgottenPasswordSubmittingReset } from "@thingco/authentication-react";
import { ForgottenPasswordSubmittingResetUi } from "test-app/stages";
import React from "react";
import uiText from "test-app/ui-copy";
import { submitNewPasswordCb } from "./callback-implementations";
import { fillInput, clickButton } from "./event-factories";


const {
	authStages: {
		forgottenPasswordSubmittingReset: { controlLabels },
	},
} = uiText;

export const ForgottenPasswordSubmittingReset = () => {
	const { error, isActive, isLoading, submitNewPassword, cancelPasswordReset } =
		useForgottenPasswordSubmittingReset(submitNewPasswordCb);

	return (
		<ForgottenPasswordSubmittingResetUi
			error={error}
			isActive={isActive}
			isLoading={isLoading}
			submitNewPassword={submitNewPassword}
			cancelPasswordReset={cancelPasswordReset}
		/>
	);
};

export const ForgottenPasswordSubmittingResetEvents = {
	fillCodeInput: fillInput(controlLabels.resetCodeInput),
	fillPasswordInput: fillInput(controlLabels.newPasswordInput),
	clickSubmit: clickButton(controlLabels.submitReset),
	clickResendCode: clickButton(controlLabels.resendCode),
};
