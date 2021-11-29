import React from "react";
import { AuthStateId } from "@thingco/authentication-core";
import { useAuthenticatedLoggingOut } from "@thingco/authentication-react";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";
import { logoutCb } from "./callback-implementations";


const {
	authStages: {
		authenticatedLoggingOut: { description, controlLabels },
	},
} = uiText;

type AuthenticatedLoggingOutUiProps = ReturnType<typeof useAuthenticatedLoggingOut> & Partial<Pick<ReturnType<typeof useConfigState>, "uiLayout">>

export const AuthenticatedLoggingOutUi = ({
	error,
	isActive,
	isLoading,
	logOut,
	cancelLogOut,
	uiLayout = "MOUNT_WHEN_ACTIVE",
}: AuthenticatedLoggingOutUiProps) => {
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
}

export const AuthenticatedLoggingOut = () => {
	const { error, isActive, isLoading, logOut, cancelLogOut } = useAuthenticatedLoggingOut(logoutCb);
	const { uiLayout } = useConfigState();

	return (
		<AuthenticatedLoggingOutUi
			error={error}
			isActive={isActive}
			isLoading={isLoading}
			logOut={logOut}
			cancelLogOut={cancelLogOut}
			uiLayout={uiLayout}
		/>
	);
};
