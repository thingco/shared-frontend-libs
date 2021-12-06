import { AuthStateId } from "@thingco/authentication-core";
import { useSubmittingNewPin } from "@thingco/authentication-react";
import React, { useState } from "react";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";
import type { Optional } from "utility-types";
import { setNewPinCb } from "./callback-implementations";


const {
	authStages: {
		submittingNewPin: { description, controlLabels },
	},
} = uiText;

type SubmittingNewPinUiProps = Optional<ReturnType<typeof useSubmittingNewPin>, "validationErrors"> & Partial<Pick<ReturnType<typeof useConfigState>, "uiLayout">>;

export const SubmittingNewPinUi = ({
	error,
	isActive,
	isLoading,
	setNewPin,
	validationErrors = { pin: [] },
	uiLayout = "MOUNT_WHEN_ACTIVE",
}: SubmittingNewPinUiProps) => {
	const [pin, setPin] = useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.SubmittingNewPin}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={setNewPin} cbParams={[pin]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						id="otp"
						inputType="text"
						isActive={isActive}
						label={controlLabels.newPinInput}
						validationErrors={validationErrors.pin}
						value={pin}
						valueSetter={setPin}
					/>
					<Form.Controls>
						<Form.Submit label={controlLabels.submitPin} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
}

export const SubmittingNewPin = () => {
	const { error, isActive, isLoading, setNewPin, validationErrors } =
		useSubmittingNewPin(setNewPinCb);
	const { uiLayout } = useConfigState();

	return (
		<SubmittingNewPinUi
			error={error}
			isLoading={isLoading}
			isActive={isActive}
			setNewPin={setNewPin}
			validationErrors={validationErrors}
			uiLayout={uiLayout}
		/>
	);
};
