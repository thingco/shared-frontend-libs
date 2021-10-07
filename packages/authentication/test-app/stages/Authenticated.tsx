import React from "react";
import { c } from "compress-tag";

import { AuthStateId } from "../../auth-system";
import { useConfigState } from "../ConfigInjector";
import { useAuthenticated } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
The user is now authenticated. They have navigated login and a token is
stored locally. They have set up/input a PIN (if that is a requirement).
\n\n
From this state, they can log out, change their password (if the login
flow is USERNAME_PASSWORD) and change their PIN (if PIN is a requirement).
`;

export const Authenticated = () => {
	const { isActive, requestLogOut, requestPinChange } = useAuthenticated();
	const { uiLayout, deviceSecurityType } = useConfigState();

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.Authenticated}
				description={description}
				isLoading={false}
				errorMsg="n/a"
			/>
			<Form submitCb={requestLogOut}>
				<Form.Elements disabled={!isActive}>
					<Form.Controls>
						<Form.Submit label="I want to log out!" />
					</Form.Controls>
				</Form.Elements>
			</Form>
			{deviceSecurityType === "PIN" && (
				<Form submitCb={requestPinChange}>
					<Form.Elements disabled={!isActive}>
						<Form.Controls>
							<Form.Submit label="I want to change my PIN!" />
						</Form.Controls>
					</Form.Elements>
				</Form>
			)}
		</AuthStageSection>
	);
};
