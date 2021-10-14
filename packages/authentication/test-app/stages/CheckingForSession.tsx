import React from "react";
import uiText from "test-app/ui-copy";

import { AuthStateId } from "core/enums";
import { checkSessionCb } from "./callback-implementations";
import { useCheckingForSession } from "core/react/useCheckingForSession";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";

const {
	authStages: {
		checkingForSession: { description, controlLabels },
	},
} = uiText;

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
						<Form.Submit label={controlLabels.checkForExistingSession} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
