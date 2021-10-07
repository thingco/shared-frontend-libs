import React, { useState } from "react";
import { c } from "compress-tag";

import { validatePinCb } from "./callback-implementations";
import { useConfigState } from "../ConfigInjector";
import { AuthStateId } from "../../auth-system";
import { useSubmittingCurrentPin } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
If PIN device security is active, if the user is already authenticated,
i.e. they have a valid authentication token already present, then they
are taken directly to this stage. If they have forgotten their PIN, they
may request a reset, but otherwise they will be fully authenticated and
allowed access to the app on successful submission.
`;

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
						label="Enter your PIN"
						validationErrors={validationErrors.pin}
						value={pin}
						valueSetter={setPin}
					/>
					<Form.Controls>
						<Form.Submit label="Submit your PIN" />
						<Form.SecondaryAction label="Forgotten PIN" actionCallback={requestPinReset} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
