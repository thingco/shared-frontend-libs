import React from "react";
import uiText from "test-app/ui-copy";

import { AuthStateId } from "core/enums";
import { useConfigState } from "test-app/ConfigInjector";
import { useAuthenticated } from "core/react/useAuthenticated";
import { AuthStageSection, Form } from "test-app/Components";

const {
	authStages: {
		authenticated: { description, controlLabels },
	},
} = uiText;

export const Authenticated = () => {
	const { isActive, requestLogOut, requestPasswordChange, requestPinChange } = useAuthenticated();
	const { uiLayout, deviceSecurityType, loginFlowType } = useConfigState();

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
						<Form.Submit label={controlLabels.logOut} />
					</Form.Controls>
				</Form.Elements>
			</Form>
			{loginFlowType === "USERNAME_PASSWORD" && (
				<Form submitCb={requestPasswordChange}>
					<Form.Elements disabled={!isActive}>
						<Form.Controls>
							<Form.Submit label={controlLabels.changePassword} />
						</Form.Controls>
					</Form.Elements>
				</Form>
			)}
			{deviceSecurityType === "PIN" && (
				<Form submitCb={requestPinChange}>
					<Form.Elements disabled={!isActive}>
						<Form.Controls>
							<Form.Submit label={controlLabels.changePin} />
						</Form.Controls>
					</Form.Elements>
				</Form>
			)}
		</AuthStageSection>
	);
};