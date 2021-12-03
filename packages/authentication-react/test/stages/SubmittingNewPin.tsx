import { useSubmittingNewPin } from "@thingco/authentication-react";
import { SubmittingNewPinUi } from "test-app/stages";
import React from "react";
import uiText from "test-app/ui-copy";
import { setNewPinCb } from "./callback-implementations";
import { fillInput, clickButton } from "./event-factories";


const {
	authStages: {
		submittingNewPin: { controlLabels },
	},
} = uiText;

export const SubmittingNewPin = () => {
	const { error, isActive, isLoading, setNewPin} =
		useSubmittingNewPin(setNewPinCb);

	return (
		<SubmittingNewPinUi
			error={error}
			isLoading={isLoading}
			isActive={isActive}
			setNewPin={setNewPin}
		/>
	);
};

export const SubmittingNewPinEvents = {
	fillPinInput: fillInput(controlLabels.newPinInput),
	clickSubmit: clickButton(controlLabels.submitPin),
};
