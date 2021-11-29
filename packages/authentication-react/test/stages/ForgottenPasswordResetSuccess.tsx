import { useForgottenPasswordResetSuccess } from "@thingco/authentication-react";
import { ForgottenPasswordResetSuccessUi } from "test-app/stages";
import React from "react";
import uiText from "test-app/ui-copy";
import { clickButton } from "./event-factories";

const {
	authStages: {
		forgottenPasswordResetSuccess: { controlLabels },
	},
} = uiText;

export const ForgottenPasswordResetSuccess = () => {
	const { isActive, confirmPasswordReset } = useForgottenPasswordResetSuccess();

	return (
		<ForgottenPasswordResetSuccessUi
			isActive={isActive}
			confirmPasswordReset={confirmPasswordReset}
		/>
	);
};

export const ForgottenPasswordResetSuccessEvents = {
	confirmReset: clickButton(controlLabels.confirm),
};
