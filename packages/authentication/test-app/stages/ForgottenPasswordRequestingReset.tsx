import React from "react";
import { c } from "compress-tag";

import { requestNewPasswordCb } from "./callback-implementations";
import { useConfigState } from "../ConfigInjector";
import { AuthStateId } from "../../auth-system";
import { useForgottenPasswordRequestingReset } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
If an unauthenticated user on USERNAME_PASSWORD flow has forgotten their
password, they can request a reset. The reset process is split into three
stages -- request, submit and success. If they continue by submitting their
username (i.e. their email address), then a code will be sent to them that
will allow them to pass the next stage (submission). Once the user has submitted
their email, they cannot back out -- the password will have been reset on the
system, so this stage also allows them a chance to cancel.
`;

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
						label="Enter an email address"
						validationErrors={validationErrors.username}
						value={username}
						valueSetter={setUsername}
					/>
					<Form.Controls>
						<Form.SecondaryAction label="Cancel" actionCallback={cancelResetPasswordRequest} />
						<Form.Submit label="Submit" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
