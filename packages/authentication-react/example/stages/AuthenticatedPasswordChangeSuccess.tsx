import React from "react";
import { AuthStateId } from "@thingco/authentication-core";
import { useAuthenticatedPasswordChangeSuccess } from "@thingco/authentication-react";
import { AuthStageSection, Form } from "test-app/Components";
import { UiLayout, useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";


const {
	authStages: {
		authenticatedPasswordChangeSuccess: { description, controlLabels },
	},
} = uiText;

type AuthenticatedPasswordChangeSuccessUiProps = {
	isActive: boolean;
	confirmPasswordChange: ReturnType<typeof useAuthenticatedPasswordChangeSuccess>["confirmPasswordChange"];
	uiLayout?: UiLayout;
}

export const AuthenticatedPasswordChangeSuccessUi = ({
	isActive,
	confirmPasswordChange,
	uiLayout = "MOUNT_WHEN_ACTIVE",
}: AuthenticatedPasswordChangeSuccessUiProps) => {
	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.AuthenticatedPasswordChangeSuccess}
				isLoading={false}
				description={description}
				errorMsg="n/a"
			/>
			<Form submitCb={confirmPasswordChange}>
				<Form.Elements disabled={!isActive}>
					<Form.Controls>
						<Form.Submit label={controlLabels.confirm} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
}

export const AuthenticatedPasswordChangeSuccess = () => {
	const { isActive, confirmPasswordChange } = useAuthenticatedPasswordChangeSuccess();
	const { uiLayout } = useConfigState();

	return (
		<AuthenticatedPasswordChangeSuccessUi
			isActive={isActive}
			confirmPasswordChange={confirmPasswordChange}
			uiLayout={uiLayout}
		/>
	)
};
