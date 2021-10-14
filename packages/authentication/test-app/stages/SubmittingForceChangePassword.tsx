import React from "react";
import uiText from "test-app/ui-copy";

import { AuthStateId } from "core/auth-system";
import { validateForceChangePasswordCb } from "./callback-implementations";
import { useSubmittingForceChangePassword } from "core/react/useSubmittingForceChangePassword";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";

const {
	authStages: {
		submittingForceChangePassword: { description, controlLabels },
	},
} = uiText;

export const SubmittingForceChangePassword = () => {
	const { error, isLoading, isActive, validationErrors, validateNewPassword } =
		useSubmittingForceChangePassword(validateForceChangePasswordCb);
	const { uiLayout } = useConfigState();

	const [password, setPassword] = React.useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.SubmittingForceChangePassword}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={validateNewPassword} cbParams={[password]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						id="password"
						inputType="text"
						isActive={isActive}
						label={controlLabels.newPasswordInput}
						validationErrors={validationErrors["password"]}
						value={password}
						valueSetter={setPassword}
					/>
					<Form.Controls>
						<Form.Submit label={controlLabels.submitPassword} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
