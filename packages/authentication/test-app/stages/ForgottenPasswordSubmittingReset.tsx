import React from "react";
import uiText from "test-app/ui-copy";

import { AuthStateId } from "core/auth-system";
import { submitNewPasswordCb } from "./callback-implementations";
import { useForgottenPasswordSubmittingReset } from "core/react/useForgottenPasswordSubmittingReset";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";

const {
	authStages: {
		forgottenPasswordSubmittingReset: { description, controlLabels },
	},
} = uiText;

export const ForgottenPasswordSubmittingReset = () => {
	const { error, isActive, isLoading, validationErrors, submitNewPassword, cancelPasswordReset } =
		useForgottenPasswordSubmittingReset(submitNewPasswordCb);
	const { uiLayout } = useConfigState();

	const [code, setCode] = React.useState("");
	const [newPassword, setNewPassword] = React.useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.ForgottenPasswordSubmittingReset}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={submitNewPassword} cbParams={[code, newPassword]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						id="resetCode"
						inputType="text"
						isActive={isActive}
						label={controlLabels.resetCodeInput}
						validationErrors={validationErrors["code"]}
						value={code}
						valueSetter={setCode}
					/>
					<Form.InputGroup
						id="newPassword"
						inputType="text"
						isActive={isActive}
						label={controlLabels.newPasswordInput}
						validationErrors={validationErrors["newPassword"]}
						value={newPassword}
						valueSetter={setNewPassword}
					/>
					<Form.Controls>
						<Form.Submit label={controlLabels.submitReset} />
						<Form.SecondaryAction
							label={controlLabels.resendCode}
							actionCallback={cancelPasswordReset}
						/>
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
