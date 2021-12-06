import React from "react";
import { AuthStateId} from "@thingco/authentication-core";
import { useAuthenticated } from "@thingco/authentication-react";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";

const {
	authStages: {
		authenticated: { description, controlLabels },
	},
} = uiText;

type AuthenticatedUiProps = Omit<ReturnType<typeof useAuthenticated>, "isAuthenticated"> & Partial<Pick<ReturnType<typeof useConfigState>, "uiLayout">> & Pick<ReturnType<typeof useConfigState>, "loginFlowType" | "deviceSecurityType">;

export const AuthenticatedUi = ({
	deviceSecurityType,
	isActive,
	loginFlowType,
	requestLogOut,
	requestPasswordChange,
	requestPinChange,
	uiLayout = "MOUNT_WHEN_ACTIVE",
}: AuthenticatedUiProps) => {
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


export const Authenticated = () => {
	const { isActive, requestLogOut, requestPasswordChange, requestPinChange } = useAuthenticated();
	const { uiLayout, deviceSecurityType, loginFlowType } = useConfigState();
	return (
		<AuthenticatedUi
			isActive={isActive}
			requestLogOut={requestLogOut}
			requestPasswordChange={requestPasswordChange}
			requestPinChange={requestPinChange}
			uiLayout={uiLayout}
			deviceSecurityType={deviceSecurityType}
			loginFlowType={loginFlowType}
		/>
	)
};
