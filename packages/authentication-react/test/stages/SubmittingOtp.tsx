import { useSubmittingOtp } from "@thingco/authentication-react";
import React from "react";
import { SubmittingOtpUi } from "test-app/stages";
import uiText from "test-app/ui-copy";
import { validateOtpCb } from "./callback-implementations";
import { clickButton, fillInput } from "./event-factories";


const {
	authStages: {
		submittingOtp: { controlLabels },
	},
} = uiText;


export const SubmittingOtp = () => {
	const { attemptsMade, error, isActive, isLoading, validateOtp, goBack } =
		useSubmittingOtp(validateOtpCb);

	return (
		<SubmittingOtpUi
			attemptsMade={attemptsMade}
			error={error}
			isLoading={isLoading}
			isActive={isActive}
			validateOtp={validateOtp}
			goBack={goBack}
		/>
	);
};

export const SubmittingOtpEvents = {
	fillOtpInput: fillInput(controlLabels.otpInput),
	clickSubmit: clickButton(controlLabels.submitOtp),
	clickGoBack: clickButton(controlLabels.reenterUsername),
};
