import React from "react";
import { c } from "compress-tag";

import { AuthStateId } from "../../auth-system";
import { useConfigState } from "../ConfigInjector";
import { useAuthenticatedPasswordChangeSuccess } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
The user is authenticated using USERNAME_PASSWORD flow and has successfully
changed their password.
\n\n
This state exists to make it easier to communicate this information to the user,
and to make it easier [from a navigation structure point of view] for the
user to return to the place in the app from where they started the password
change process. In an actual app, this could simply be a popup or flash,
either timed or with a confirm button.
`;

export const AuthenticatedPasswordChangeSuccess = () => {
	const { isActive, confirmPasswordChange } = useAuthenticatedPasswordChangeSuccess();
	const { uiLayout } = useConfigState();

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.AuthenticatedPasswordChangeSuccess}
				isLoading={false}
				description={description}
				errorMsg="n/a"
			/>
			<Form submitCb={confirmPasswordChange}>
				<Form.Elements disabled={!isActive}>
					<Form.Controls>
						<Form.Submit label="Confirm" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
