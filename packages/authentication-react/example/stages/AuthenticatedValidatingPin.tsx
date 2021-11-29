import {  AuthStateId } from "@thingco/authentication-core";
import { useAuthenticatedValidatingPin } from "@thingco/authentication-react";
import React, { useState } from "react";
import { AuthStageSection, Form } from "test-app/Components";
import {  useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";
import { Optional } from "utility-types";
import { validatePinCb } from "./callback-implementations";


const {
	authStages: {
		authenticatedValidatingPin: { description, controlLabels },
	},
} = uiText;


type AuthenticatedValidatingPinUiProps = Optional<ReturnType<typeof useAuthenticatedValidatingPin>, "validationErrors"> & Partial<Pick<ReturnType<typeof useConfigState>, "uiLayout">>


export const AuthenticatedValidatingPinUi = ({
	error,
	isActive,
	isLoading,
	validatePin,
	cancelChangePin,
	validationErrors = { pin: [] },
	uiLayout = "MOUNT_WHEN_ACTIVE",
}: AuthenticatedValidatingPinUiProps) => {
	const [pin, setPin] = useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.SubmittingCurrentPin}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={validatePin} cbParams={[pin]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						id="otp"
						inputType="text"
						isActive={isActive}
						label={controlLabels.enterPin}
						validationErrors={validationErrors.pin}
						value={pin}
						valueSetter={setPin}
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

export const AuthenticatedValidatingPin = () => {
	const { error, isActive, isLoading, validatePin, cancelChangePin, validationErrors } =
		useAuthenticatedValidatingPin(validatePinCb);
	const { uiLayout } = useConfigState();

	return (
		<AuthenticatedValidatingPinUi
			error={error}
			isActive={isActive}
			isLoading={isLoading}
			validatePin={validatePin}
			cancelChangePin={cancelChangePin}
			validationErrors={validationErrors}
			uiLayout={uiLayout}
		/>
	);
};
