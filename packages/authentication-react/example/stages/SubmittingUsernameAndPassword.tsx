import { AuthStateId } from "@thingco/authentication-core";
import { useSubmittingUsernameAndPassword } from "@thingco/authentication-react";
import React, { useState } from "react";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";
import { Optional } from "utility-types";
import { validateUsernameAndPasswordCb } from "./callback-implementations";


const {
	authStages: {
		submittingUsernameAndPassword: { description, controlLabels },
	},
} = uiText;

type SubmittingUsernameAndPasswordUiProps = Optional<ReturnType<typeof useSubmittingUsernameAndPassword>, "validationErrors"> & Partial<Pick<ReturnType<typeof useConfigState>, "uiLayout">>

export const SubmittingUsernameAndPasswordUi = ({
	error,
	isActive,
	isLoading,
	validateUsernameAndPassword,
	forgottenPassword,
	validationErrors = { username: [], password: [] },
	uiLayout = "MOUNT_WHEN_ACTIVE",
}: SubmittingUsernameAndPasswordUiProps) => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.SubmittingUsernameAndPassword}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={validateUsernameAndPassword} cbParams={[username, password]}>
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

	return (
		<SubmittingUsernameAndPasswordUi
			error={error}
			isLoading={isLoading}
			isActive={isActive}
			validateUsernameAndPassword={validateUsernameAndPassword}
			forgottenPassword={forgottenPassword}
			validationErrors={validationErrors}
			uiLayout={uiLayout}
		/>
	);
};
