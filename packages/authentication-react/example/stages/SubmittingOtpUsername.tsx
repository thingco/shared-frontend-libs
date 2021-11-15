import { AuthStateId } from "@thingco/authentication-core";
import { useSubmittingOtpUsername } from "@thingco/authentication-react";
import React from "react";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";
import { validateOtpUsernameCb } from "./callback-implementations";


const {
	authStages: {
		submittingOtpUsername: { description, controlLabels },
	},
} = uiText;

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
						label={controlLabels.otpUsernameInput}
						validationErrors={validationErrors.username}
						value={username}
						valueSetter={setUsername}
					/>
					<Form.Controls>
						<Form.Submit label={controlLabels.submitOtpUsername} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
