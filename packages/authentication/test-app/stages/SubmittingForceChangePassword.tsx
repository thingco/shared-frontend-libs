import React from "react";
import { c } from "compress-tag";

import { validateForceChangePasswordCb } from "./callback-implementations";
import { useConfigState } from "../ConfigInjector";
import { AuthStateId } from "../../auth-system";
import { useSubmittingForceChangePassword } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
The user is authenticated on USERNAME_PASSWORD flow, has successfully submitted
their username and password, but this is either the first time they have
authenticated against their account, or their password has been reset by an admin.
In this case, the password they currently have is temporary (it will have been
sent to them in plaintext), so they must change it. Once it has been changeded,
they are fully authenticated.
\n\n
In an actual app, it may be provident to double up on the new password input
("enter your new password"/"confirm your new password") to ensure that the user
has correctly entered the password they wanted.
`;

export const SubmittingForceChangePassword = () => {
	const { error, isLoading, isActive, validationErrors, validateNewPassword } =
		useSubmittingForceChangePassword(validateForceChangePasswordCb);
	const { uiLayout } = useConfigState();

	const [password, setPassword] = React.useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.SubmittingOtpUsername}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={validateNewPassword} cbParams={[password]}>
				<Form.Elements disabled={isActive}>
					<Form.InputGroup
						id="password"
						inputType="text"
						isActive={isActive}
						label="Enter your password"
						validationErrors={validationErrors["password"]}
						value={password}
						valueSetter={setPassword}
					/>
					<Form.Controls>
						<Form.Submit label="Submit new password" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
