import React, { useState } from "react";
import { c } from "compress-tag";

import { validatePinCb } from "./callback-implementations";
import { useConfigState } from "../ConfigInjector";
import { AuthStateId } from "../../auth-system";
import { useAuthenticatedValidatingPin } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
The user is already authenticated, is using PIN security, and has requested
that they wish to change their PIN. The user needs to validate their
current PIN before setting a new one. Note that they may cancel this request
at this point.
`;

export const AuthenticatedValidatingPin = () => {
	const { error, isActive, isLoading, validatePin, cancelChangePin, validationErrors } =
		useAuthenticatedValidatingPin(validatePinCb);
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
						label="Enter your PIN"
						validationErrors={validationErrors.pin}
						value={pin}
						valueSetter={setPin}
					/>
					<Form.Controls>
						<Form.Submit label="Submit your PIN" />
						<Form.SecondaryAction label="Cancel change PIN" actionCallback={cancelChangePin} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
