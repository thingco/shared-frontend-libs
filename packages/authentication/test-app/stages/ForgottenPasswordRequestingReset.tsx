import React from "react";

import uiText from "test-app/ui-copy";
import { AuthStateId } from "core/auth-system";
import { requestNewPasswordCb } from "./callback-implementations";
import { useForgottenPasswordRequestingReset } from "core/react/useForgottenPasswordRequestingReset";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";

const {
	authStages: {
		forgottenPasswordRequestingReset: { description, controlLabels },
	},
} = uiText;

export const ForgottenPasswordRequestingReset = () => {
	const {
		error,
		isActive,
		isLoading,
		cancelResetPasswordRequest,
		requestNewPassword,
		validationErrors,
	} = useForgottenPasswordRequestingReset(requestNewPasswordCb);
	const { uiLayout } = useConfigState();

	const [username, setUsername] = React.useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.ForgottenPasswordRequestingReset}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={requestNewPassword} cbParams={[username]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						id="username"
						inputType="email"
						isActive={isActive}
						label={controlLabels.enterEmailInput}
						validationErrors={validationErrors.username}
						value={username}
						valueSetter={setUsername}
					/>
					<Form.Controls>
						<Form.SecondaryAction
							label={controlLabels.cancelPasswordReset}
							actionCallback={cancelResetPasswordRequest}
						/>
						<Form.Submit label={controlLabels.requestResetCode} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
