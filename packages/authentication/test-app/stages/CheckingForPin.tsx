import React from "react";
import { c } from "compress-tag";

import { checkForExistingPinCb } from "./callback-implementations";
import { useConfigState } from "../ConfigInjector";
import { AuthStateId } from "../../auth-system";
import { useCheckingForPin } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
First stage of device security. The application using the
authentication system has to check to see if there is a stored
PIN. If there isn't, they'll have to set a new one. If there is,
they can move on to device security (if that is active).
\n\n
In a real app, this stage should occur automatically and be hidden
from the user.
`;

export const CheckingForPin = () => {
	const { isActive, isLoading, checkForExistingPin, error } =
		useCheckingForPin(checkForExistingPinCb);
	const { uiLayout } = useConfigState();

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.CheckingForPin}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={checkForExistingPin}>
				<Form.Elements disabled={!isActive || isLoading}>
					<Form.Controls>
						<Form.Submit label="Check for existing PIN" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
