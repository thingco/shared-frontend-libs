import React from "react";
import uiText from "test-app/ui-copy";

import { AuthStateId } from "core/enums";
import { useAuthenticatedLoggingOut } from "core/react/useAuthenticatedLoggingOut";
import { logoutCb } from "./callback-implementations";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";

const {
	authStages: {
		authenticatedLoggingOut: { description, controlLabels },
	},
} = uiText;

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
						<Form.Submit label={controlLabels.logOut} />
						<Form.SecondaryAction
							label={controlLabels.cancelLogOut}
							actionCallback={cancelLogOut}
						/>
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
