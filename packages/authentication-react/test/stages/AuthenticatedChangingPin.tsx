import { useAuthenticatedChangingPin } from "@thingco/authentication-react";
import React from "react";
import { AuthenticatedChangingPinUi } from "test-app/stages"
import uiText from "test-app/ui-copy";
import { setNewPinCb } from "./callback-implementations";
import { clickButton, fillInput  } from "./event-factories";


const {
	authStages: {
		authenticatedChangingPin: { controlLabels },
	},
} = uiText;


export const AuthenticatedChangingPin = () => {
	const { error, isActive, isLoading, changePin, cancelChangePin } =
		useAuthenticatedChangingPin(setNewPinCb);

	return (
		<AuthenticatedChangingPinUi
			error={error}
			isActive={isActive}
			isLoading={isLoading}
			changePin={changePin}
			cancelChangePin={cancelChangePin}
		/>
	);
};

export const AuthenticatedChangingPinEvents = {
	fillPinInput: fillInput(controlLabels.enterPinInput),
	clickPinSubmit: clickButton(controlLabels.submitPin),
	clickCancel: clickButton(controlLabels.cancelPinChange),
};
