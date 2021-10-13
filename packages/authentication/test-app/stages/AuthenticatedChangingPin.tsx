import React, { useState } from "react";
import uiText from "test-app/ui-copy";

import { setNewPinCb } from "./callback-implementations";
import { AuthStateId } from "core/auth-system";
import { useAuthenticatedChangingPin } from "core/react";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";

const {
	authStages: {
		authenticatedChangingPin: { description, controlLabels },
	},
} = uiText;

export const AuthenticatedChangingPin = () => {
	const { error, isActive, isLoading, changePin, cancelChangePin, validationErrors } =
		useAuthenticatedChangingPin(setNewPinCb);
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
			<Form submitCb={changePin} cbParams={[pin]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						id="otp"
						inputType="text"
						isActive={isActive}
						label={controlLabels.enterPinInput}
						validationErrors={validationErrors.newPin}
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
};
