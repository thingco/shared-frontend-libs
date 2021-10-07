import React from "react";
import { c } from "compress-tag";

import { submitNewPasswordCb } from "./callback-implementations";
import { useConfigState } from "../ConfigInjector";
import { AuthStateId } from "../../auth-system";
import { useForgottenPasswordSubmittingReset } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
An unauthenticated user on USERNAME_PASSWORD flow has forgotten their
password and have requested a reset. A code has been sent to them that
will allow them to pass this stage. So they need to enter the code plus
the new password. Note  that unfortunately, due to the way the AWS
libraries that interface with Cognito work, the code input and the new
password input cannot be split across stages -- the UI for this stage
must handle both.
\n\n
In the actual app, it may be provident to double up on the new password input
("enter your new password"/"confirm your new password") to ensure that the user
has correctly entered the password they wanted.
`;

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
						label="Enter the reset code you have been sent"
						validationErrors={validationErrors["code"]}
						value={code}
						valueSetter={setCode}
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
						<Form.Submit label="Submit reset code and new password" />
						<Form.SecondaryAction label="Resend code" actionCallback={cancelPasswordReset} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
