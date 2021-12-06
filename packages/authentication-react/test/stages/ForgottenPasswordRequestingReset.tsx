import { useForgottenPasswordRequestingReset } from "@thingco/authentication-react";
import { ForgottenPasswordRequestingResetUi } from "test-app/stages";
import React from "react";
import uiText from "test-app/ui-copy";
import { requestNewPasswordCb } from "./callback-implementations";
import { clickButton, fillInput } from "./event-factories";

const {
	authStages: {
		forgottenPasswordRequestingReset: { controlLabels },
	},
} = uiText;

export const ForgottenPasswordRequestingReset = () => {
	const {
		error,
		isActive,
		isLoading,
		cancelResetPasswordRequest,
		requestNewPassword,
	} = useForgottenPasswordRequestingReset(requestNewPasswordCb);

	return (
		<ForgottenPasswordRequestingResetUi
			isActive={isActive}
			isLoading={isLoading}
			cancelResetPasswordRequest={cancelResetPasswordRequest}
			requestNewPassword={requestNewPassword}
			error={error}
		/>
	);
};

export const ForgottenPasswordRequestingResetEvents = {
	fillEmailInput: fillInput(controlLabels.enterEmailInput),
	clickRequestNewPassword: clickButton(controlLabels.requestResetCode),
	clickCancel: clickButton(controlLabels.cancelPasswordReset),
};
