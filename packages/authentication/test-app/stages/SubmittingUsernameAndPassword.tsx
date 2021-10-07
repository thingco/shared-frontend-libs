import React from "react";
import { c } from "compress-tag";

import { validateUsernameAndPasswordCb } from "./callback-implementations";
import { useConfigState } from "../ConfigInjector";
import { AuthStateId } from "../../auth-system";
import { useSubmittingUsernameAndPassword } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
USERNAME_PASSWORD authentication flow requires that the user submit
their username and their password. If they have forgotten the password,
they also have the option to request a reset. If this is the first time
they have logged into the account (or an admin has reset their password),
the next stage is to change the temporary password they have been assigned,
but otherwise they are authenticated if this stage is passed successfully.
`;

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
						label="Enter an email address"
						validationErrors={validationErrors.username}
						value={username}
						valueSetter={setUsername}
					/>
					<Form.InputGroup
						id="password"
						inputType="password"
						isActive={isActive}
						label="Enter password"
						validationErrors={validationErrors.password}
						value={password}
						valueSetter={setPassword}
					/>
					<Form.Controls>
						<Form.SecondaryAction label="Forgotten Password" actionCallback={forgottenPassword} />
						<Form.Submit label="Log in" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
