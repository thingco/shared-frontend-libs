import React, { useState } from "react";
import { c } from "compress-tag";

import { setNewPinCb } from "./callback-implementations";
import { useConfigState } from "../ConfigInjector";
import { AuthStateId } from "../../auth-system";
import { useSubmittingNewPin } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
If PIN device security is active, when the user logs in they have to set a
new PIN. The PIN is wiped every time the user logs out, so this stage is
reached every time they go through the login flow.
\n\n
In the actual app, it may be provident to double up on the new PIN input
("enter your new PIN"/"confirm your new PIN") to ensure that the user
has correctly entered the PIN they wanted.
`;

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
						label="Enter your new PIN"
						validationErrors={validationErrors.pin}
						value={pin}
						valueSetter={setPin}
					/>
					<Form.Controls>
						<Form.Submit label="Submit new PIN" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
