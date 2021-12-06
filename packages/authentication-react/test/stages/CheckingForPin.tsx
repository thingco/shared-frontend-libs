import React from "react";
import { useCheckingForPin } from "@thingco/authentication-react";
import { CheckingForPinUi } from "test-app/stages";
import uiText from "test-app/ui-copy";
import { checkForExistingPinCb } from "./callback-implementations";
import { clickButton } from "./event-factories";

const {
	authStages: {
		checkingForPin: { controlLabels },
	},
} = uiText;


export const CheckingForPin = () => {
	const { isActive, isLoading, checkForExistingPin, error } =
		useCheckingForPin(checkForExistingPinCb);

	return (
		<CheckingForPinUi
			isActive={isActive}
			isLoading={isLoading}
			checkForExistingPin={checkForExistingPin}
			error={error}
		/>
	);
};

export const CheckingForPinEvents = {
	clickCheckForPin: clickButton(controlLabels.checkForExistingPin),
};
