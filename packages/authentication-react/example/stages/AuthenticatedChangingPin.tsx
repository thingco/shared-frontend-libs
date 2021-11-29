import { AuthError, AuthStateId } from "@thingco/authentication-core";
import { useAuthenticatedChangingPin } from "@thingco/authentication-react";
import React, { useState } from "react";
import { AuthStageSection, Form } from "test-app/Components";
import { UiLayout, useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";
import { Optional } from "utility-types";
import { setNewPinCb } from "./callback-implementations";


const {
	authStages: {
		authenticatedChangingPin: { description, controlLabels },
	},
} = uiText;

type AuthenticatedChangingPinUiProps = Optional<ReturnType<typeof useAuthenticatedChangingPin>, "validationErrors"> & Partial<Pick<ReturnType<typeof useConfigState>, "uiLayout">>

export const AuthenticatedChangingPinUi = ({
	error,
	isActive,
	isLoading,
	changePin,
	cancelChangePin,
	uiLayout = "MOUNT_WHEN_ACTIVE",
	validationErrors = { newPin: [] }
}: AuthenticatedChangingPinUiProps) => {
	const [newPin, setNewPin] = useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.AuthenticatedChangingPin}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={changePin} cbParams={[newPin]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						id="otp"
						inputType="text"
						isActive={isActive}
						label={controlLabels.enterPinInput}
						validationErrors={validationErrors.newPin}
						value={newPin}
						valueSetter={setNewPin}
					/>
					<Form.Controls>
						<Form.Submit label={controlLabels.submitPin} />
						<Form.SecondaryAction
							label={controlLabels.cancelPinChange}
							actionCallback={cancelChangePin}
						/>
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
}

export const AuthenticatedChangingPin = () => {
	const { error, isActive, isLoading, changePin, cancelChangePin, validationErrors } =
		useAuthenticatedChangingPin(setNewPinCb);
	const { uiLayout } = useConfigState();

	return (
		<AuthenticatedChangingPinUi
			error={error}
			isActive={isActive}
			isLoading={isLoading}
			changePin={changePin}
			cancelChangePin={cancelChangePin}
			uiLayout={uiLayout}
			validationErrors={validationErrors}
		/>
	);
};
