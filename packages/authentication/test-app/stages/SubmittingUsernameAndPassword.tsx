import React from "react";
import uiText from "test-app/ui-copy";

import { AuthStateId } from "core/auth-system";
import { validateUsernameAndPasswordCb } from "./callback-implementations";
import { useSubmittingUsernameAndPassword } from "core/react/useSubmittingUsernameAndPassword";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";

const {
	authStages: {
		submittingUsernameAndPassword: { description, controlLabels },
	},
} = uiText;

export const SubmittingUsernameAndPassword = () => {
	const {
		error,
		isActive,
		isLoading,
		validateUsernameAndPassword,
		forgottenPassword,
		validationErrors,
	} = useSubmittingUsernameAndPassword(validateUsernameAndPasswordCb);
	const { uiLayout } = useConfigState();

	const [username, setUsername] = React.useState("");
	const [password, setPassword] = React.useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.SubmittingUsernameAndPassword}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={validateUsernameAndPassword} cbParams={[username]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						id="username"
						inputType="email"
						isActive={isActive}
						label={controlLabels.usernameInput}
						validationErrors={validationErrors.username}
						value={username}
						valueSetter={setUsername}
					/>
					<Form.InputGroup
						id="password"
						inputType="password"
						isActive={isActive}
						label={controlLabels.passwordInput}
						validationErrors={validationErrors.password}
						value={password}
						valueSetter={setPassword}
					/>
					<Form.Controls>
						<Form.SecondaryAction
							label={controlLabels.forgotPassword}
							actionCallback={forgottenPassword}
						/>
						<Form.Submit label={controlLabels.logIn} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
