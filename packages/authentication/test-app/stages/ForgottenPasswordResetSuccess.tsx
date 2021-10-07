import React from "react";
import { c } from "compress-tag";

import { AuthStateId } from "../../auth-system";
import { useConfigState } from "../ConfigInjector";
import { useForgottenPasswordResetSuccess } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
The user is unauthenticated using USERNAME_PASSWORD flow and has successfully
changed their password after indicating that they had forgotten their existing
password.
\n\n
This state exists to make it easier to communicate this information to the user.
In an actual app, this could simply be a popup or flash, either timed or
with a confirm button.
`;

export const ForgottenPasswordResetSuccess = () => {
	const { isActive, confirmPasswordReset } = useForgottenPasswordResetSuccess();
	const { uiLayout } = useConfigState();

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.ForgottenPasswordResetSuccess}
				isLoading={false}
				description={description}
				errorMsg="n/a"
			/>
			<Form submitCb={confirmPasswordReset}>
				<Form.Elements disabled={!isActive}>
					<Form.Controls>
						<Form.Submit label="Confirm" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
