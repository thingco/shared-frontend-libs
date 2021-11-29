import { useSubmittingCurrentPin } from "@thingco/authentication-react";
import { SubmittingCurrentPinUi } from "test-app/stages"
import React from "react";
import uiText from "test-app/ui-copy";
import { validatePinCb } from "./callback-implementations";
import { fillInput, clickButton } from "./event-factories";


const {
	authStages: {
		submittingCurrentPin: { controlLabels },
	},
} = uiText;


export const SubmittingCurrentPin = () => {
	const { error, isActive, isLoading, validatePin, requestPinReset } =
		useSubmittingCurrentPin(validatePinCb);

	return (
		<SubmittingCurrentPinUi
			error={error}
			isActive={isActive}
			isLoading={isLoading}
			validatePin={validatePin}
			requestPinReset={requestPinReset}
		/>
	);
};

export const SubmittingCurrentPinEvents = {
	fillPinInput: fillInput(controlLabels.pinInput),
	clickSubmit: clickButton(controlLabels.submitPin),
	clickForgotPin: clickButton(controlLabels.forgotPin),
};
