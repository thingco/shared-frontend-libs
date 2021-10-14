import React, { useState } from "react";
import uiText from "test-app/ui-copy";

import { AuthStateId } from "core/enums";
import { setNewPinCb } from "./callback-implementations";
import { useSubmittingNewPin } from "core/react/useSubmittingNewPin";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";

const {
	authStages: {
		submittingNewPin: { description, controlLabels },
	},
} = uiText;

export const SubmittingNewPin = () => {
	const { error, isActive, isLoading, setNewPin, validationErrors } =
		useSubmittingNewPin(setNewPinCb);
	const { uiLayout } = useConfigState();

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
};
