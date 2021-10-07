import React from "react";
import { c } from "compress-tag";

import { changePasswordCb } from "./callback-implementations";
import { AuthStateId } from "../../auth-system";
import { useConfigState } from "../ConfigInjector";
import { useAuthenticatedChangingPassword } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
The user is already authenticated on USERNAME_PASSWORD flow and has requested
that they wish to change their password.
\n\n
They may cancel this request at this point, but if they continue, the method
provided by the state hook accepts the current password and the new password.
In the actual app, it may be provident to double up on the new password input
("enter your new password"/"confirm your new password") to ensure that the user
has correctly entered the password they wanted.
`;

export const AuthenticatedChangingPassword = () => {
	const { error, isActive, isLoading, submitNewPassword, cancelChangePassword, validationErrors } =
		useAuthenticatedChangingPassword(changePasswordCb);
	const { uiLayout } = useConfigState();

	const [oldPassword, setOldPassword] = React.useState("");
	const [newPassword, setNewPassword] = React.useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.AuthenticatedChangingPassword}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={submitNewPassword} cbParams={[oldPassword]}>
				<Form.Elements disabled={!isActive}>
					<Form.InputGroup
						id="oldPassword"
						inputType="text"
						isActive={isActive}
						label="Enter your current password"
						validationErrors={validationErrors["oldPassword"]}
						value={oldPassword}
						valueSetter={setOldPassword}
					/>
					<Form.InputGroup
						id="newPassword"
						inputType="text"
						isActive={isActive}
						label="Enter your new password"
						validationErrors={validationErrors["newPassword"]}
						value={newPassword}
						valueSetter={setNewPassword}
					/>
					<Form.Controls>
						<Form.Submit label="Change your password" />
						<Form.SecondaryAction
							label="Cancel password change"
							actionCallback={cancelChangePassword}
						/>
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
