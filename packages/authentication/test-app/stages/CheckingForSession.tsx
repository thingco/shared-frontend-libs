import React from "react";
import { c } from "compress-tag";

import { checkSessionCb } from "./callback-implementations";
import { useConfigState } from "../ConfigInjector";
import { AuthStateId } from "../../auth-system";
import { useCheckingForSession } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
Always the first stage of authentication. The application using the
authentication system has to check to see if there is a stored
token that indicates the user is already authenticated. If there
isn't, they'll have to log in. If there is, they can move on to
device security (if that is active).
\n\n
In a real app, this stage should occur automatically and be hidden
from the user.
`;

export const CheckingForSession = () => {
	const { isActive, isLoading, checkSession, error } = useCheckingForSession(checkSessionCb);
	const { uiLayout } = useConfigState();

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.CheckingForSession}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={checkSession}>
				<Form.Elements disabled={!isActive || isLoading}>
					<Form.Controls>
						<Form.Submit label="Check Session" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
