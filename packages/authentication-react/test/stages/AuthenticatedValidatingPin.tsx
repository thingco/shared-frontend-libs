import { useAuthenticatedValidatingPin } from "@thingco/authentication-react";
import { AuthenticatedValidatingPinUi } from "test-app/stages"
import React from "react";
import uiText from "test-app/ui-copy";
import { validatePinCb } from "./callback-implementations";
import { clickButton, fillInput } from "./event-factories"


const {
	authStages: {
		authenticatedValidatingPin: { controlLabels },
	},
} = uiText;


export const AuthenticatedValidatingPin = () => {
	const { error, isActive, isLoading, validatePin, cancelChangePin} =
		useAuthenticatedValidatingPin(validatePinCb);

	return (
		<AuthenticatedValidatingPinUi
			error={error}
			isActive={isActive}
			isLoading={isLoading}
			validatePin={validatePin}
			cancelChangePin={cancelChangePin}
		/>
	);
};

export const AuthenticatedValidatingPinEvents = {
	fillPinInput: fillInput(controlLabels.enterPin),
	clickSubmit: clickButton(controlLabels.submitPin),
	clickCancel: clickButton(controlLabels.cancelPinChange),
};
