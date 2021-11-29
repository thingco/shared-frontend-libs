import React from "react";
import { AuthError, AuthStateId } from "@thingco/authentication-core";
import { useCheckingForPin } from "@thingco/authentication-react";
import { AuthStageSection, Form } from "test-app/Components";
import { UiLayout, useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";
import { checkForExistingPinCb } from "./callback-implementations";

const {
	authStages: {
		checkingForPin: { description, controlLabels },
	},
} = uiText;

type CheckingForPinUiProps = {
 isActive: boolean;
 isLoading: boolean;
 checkForExistingPin: ReturnType<typeof useCheckingForPin>["checkForExistingPin"];
 error: AuthError;
 uiLayout?: UiLayout;
}

export const CheckingForPinUi = ({
	isActive,
	isLoading,
	checkForExistingPin,
	error,
	uiLayout = "MOUNT_WHEN_ACTIVE",
}: CheckingForPinUiProps) => {
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

export const CheckingForPin = () => {
	const { isActive, isLoading, checkForExistingPin, error } =
		useCheckingForPin(checkForExistingPinCb);
	const { uiLayout } = useConfigState();

	return (
		<CheckingForPinUi
			isActive={isActive}
			isLoading={isLoading}
			checkForExistingPin={checkForExistingPin}
			error={error}
			uiLayout={uiLayout}
		/>
	);
};
