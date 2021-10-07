import React from "react";
import { c } from "compress-tag";

import { AuthStateId } from "../../auth-system";
import { useConfigState } from "../ConfigInjector";
import { useAuthenticatedLoggingOut } from "../../react";
import { AuthStageSection, Form } from "../Components";
import { logoutCb } from "./callback-implementations";

const description = c`
This stage describes a situation where the user is authenticated but wishes
to log out. It's split into a separate state to make it easier to handle
cancellation. So from "Authenticated", they indicate they wish to log out. Then
they move to this state, where they can either confirm log out or cancel.
\n\n
In an actual app, this can likely be best implemented via a popup modal.
`;

export const AuthenticatedLoggingOut = () => {
	const { error, isActive, isLoading, logOut, cancelLogOut } = useAuthenticatedLoggingOut(logoutCb);
	const { uiLayout } = useConfigState();

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.Authenticated}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={logOut}>
				<Form.Elements disabled={!isActive}>
					<Form.Controls>
						<Form.Submit label="Log me out!" />
						<Form.SecondaryAction label="Cancel log out" actionCallback={cancelLogOut} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
