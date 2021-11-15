import React from "react";
import { AuthStateId } from "@thingco/authentication-core";
import { useCheckingForPin } from "@thingco/authentication-react";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";
import { checkForExistingPinCb } from "./callback-implementations";

const {
	authStages: {
		checkingForPin: { description, controlLabels },
	},
} = uiText;

export const CheckingForPin = () => {
	const { isActive, isLoading, checkForExistingPin, error } =
		useCheckingForPin(checkForExistingPinCb);
	const { uiLayout } = useConfigState();

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.CheckingForPin}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={checkForExistingPin}>
				<Form.Elements disabled={!isActive || isLoading}>
					<Form.Controls>
						<Form.Submit label={controlLabels.checkForExistingPin} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
