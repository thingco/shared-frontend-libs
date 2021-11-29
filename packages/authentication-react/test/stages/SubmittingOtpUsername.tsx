import { useSubmittingOtpUsername } from "@thingco/authentication-react";
import { SubmittingOtpUsernameUi} from "test-app/stages";
import React from "react";
import uiText from "test-app/ui-copy";
import { validateOtpUsernameCb } from "./callback-implementations";
import { fillInput, clickButton } from "./event-factories";


const {
	authStages: {
		submittingOtpUsername: { controlLabels },
	},
} = uiText;


export const SubmittingOtpUsername = () => {
	const { error, isActive, isLoading, validateUsername} =
		useSubmittingOtpUsername(validateOtpUsernameCb);

	return (
		<SubmittingOtpUsernameUi
			error={error}
			isLoading={isLoading}
			isActive={isActive}
			validateUsername={validateUsername}
		/>
	);
};

export const SubmittingOtpUsernameEvents = {
	fillUsernameInput: fillInput(controlLabels.otpUsernameInput),
	clickSubmit: clickButton(controlLabels.submitOtpUsername),
}
