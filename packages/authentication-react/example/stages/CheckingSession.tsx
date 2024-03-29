import React from "react";
import { AuthError, AuthStateId } from "@thingco/authentication-core";
import { useCheckingSession } from "@thingco/authentication-react";
import { AuthStageSection, Form } from "test-app/Components";
import { UiLayout, useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";
import { checkSessionCb } from "./callback-implementations";


const {
	authStages: {
		checkingForSession: { description, controlLabels },
	},
} = uiText;

type CheckingSessionUiProps = {
	isActive: boolean;
	isLoading: boolean;
	checkSession: ReturnType<typeof useCheckingSession>["checkSession"];
	error: AuthError;
	uiLayout?: UiLayout;
}

export const CheckingSessionUi = ({
	isActive,
	isLoading,
	checkSession,
	error,
	uiLayout = "MOUNT_WHEN_ACTIVE",
}: CheckingSessionUiProps) => {
	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.CheckingSession}
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

export const CheckingSession = () => {
	const { isActive, isLoading, checkSession, error } = useCheckingSession(checkSessionCb);
	const { uiLayout } = useConfigState();

	return (
		<CheckingSessionUi
			isActive={isActive}
			isLoading={isLoading}
			checkSession={checkSession}
			error={error}
			uiLayout={uiLayout}
		/>
	);
};
