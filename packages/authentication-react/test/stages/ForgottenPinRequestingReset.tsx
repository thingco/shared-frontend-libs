import { useForgottenPinRequestingReset } from "@thingco/authentication-react";
import { ForgottenPinRequestingResetUi } from "test-app/stages";
import React from "react";
import uiText from "test-app/ui-copy";
import { resetPinCb } from "./callback-implementations";
import { clickButton } from "./event-factories";

const {
	authStages: {
		forgottenPinRequestingReset: { controlLabels },
	},
} = uiText;

export const ForgottenPinRequestingReset = () => {
	const { error, isActive, isLoading, resetPin, cancelResetPin } =
		useForgottenPinRequestingReset(resetPinCb);

	return (
		<ForgottenPinRequestingResetUi
			error={error}
			isActive={isActive}
			isLoading={isLoading}
			resetPin={resetPin}
			cancelResetPin={cancelResetPin}
		/>
	);

};

export const ForgottenPinRequestingResetEvents = {
	clickResetPin: clickButton(controlLabels.resetPin),
	clickCancel: clickButton(controlLabels.cancelReset),
};
