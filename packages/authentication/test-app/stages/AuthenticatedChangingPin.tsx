import React, { useState } from "react";
import { c } from "compress-tag";

import { setNewPinCb } from "./callback-implementations";
import { useConfigState } from "../ConfigInjector";
import { AuthStateId } from "../../auth-system";
import { useAuthenticatedChangingPin } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
The user is already authenticated, is using PIN security, has requested
that they wish to change their PIN, and they have confirmed their current PIN.
They can now enter a new PIN. Note that they may still cancel the change
request at this point.
`;

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
						label="Enter your PIN"
						validationErrors={validationErrors.newPin}
						value={pin}
						valueSetter={setPin}
					/>
					<Form.Controls>
						<Form.Submit label="Submit your new PIN" />
						<Form.SecondaryAction label="Cancel PIN change" actionCallback={cancelChangePin} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
