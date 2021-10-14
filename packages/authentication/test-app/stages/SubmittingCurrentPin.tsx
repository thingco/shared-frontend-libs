import React, { useState } from "react";
import uiText from "test-app/ui-copy";

import { AuthStateId } from "core/auth-system";
import { validatePinCb } from "./callback-implementations";
import { useSubmittingCurrentPin } from "core/react/useSubmittingCurrentPin";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";

const {
	authStages: {
		submittingCurrentPin: { description, controlLabels },
	},
} = uiText;

export const SubmittingCurrentPin = () => {
	const { error, isActive, isLoading, validatePin, requestPinReset, validationErrors } =
		useSubmittingCurrentPin(validatePinCb);
	const { uiLayout } = useConfigState();

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
						label={controlLabels.pinInput}
						validationErrors={validationErrors.pin}
						value={pin}
						valueSetter={setPin}
					/>
					<Form.Controls>
						<Form.Submit label={controlLabels.submitPin} />
						<Form.SecondaryAction
							label={controlLabels.forgotPin}
							actionCallback={requestPinReset}
						/>
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
