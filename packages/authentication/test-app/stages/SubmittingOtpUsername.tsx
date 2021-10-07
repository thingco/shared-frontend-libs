import React from "react";
import { c } from "compress-tag";

import { validateOtpUsernameCb } from "./callback-implementations";
import { useConfigState } from "../ConfigInjector";
import { AuthStateId } from "../../auth-system";
import { useSubmittingOtpUsername } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
OTP authentication flow requires that the user submit their username
foirst, in the form of an email address, which triggers the backend
to send them a one-time password (submission of which is the next stage).
`;

export const SubmittingOtpUsername = () => {
	const { error, isActive, isLoading, validateUsername, validationErrors } =
		useSubmittingOtpUsername(validateOtpUsernameCb);
	const { uiLayout } = useConfigState();

	const [username, setUsername] = React.useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.SubmittingOtpUsername}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={validateUsername} cbParams={[username]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						id="otpUsername"
						inputType="email"
						isActive={isActive}
						label="Enter an email address"
						validationErrors={validationErrors.username}
						value={username}
						valueSetter={setUsername}
					/>
					<Form.Controls>
						<Form.Submit label="Submit username" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
