import { AuthStateId } from "@thingco/authentication-core";
import { useForgottenPasswordResetSuccess } from "@thingco/authentication-react";
import React from "react";
import { AuthStageSection, Form } from "test-app/Components";
import { UiLayout, useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";

const {
	authStages: {
		forgottenPasswordResetSuccess: { description, controlLabels },
	},
} = uiText;

type ForgottenPasswordResetSuccessUiProps = {
	isActive: boolean;
	confirmPasswordReset: ReturnType<typeof useForgottenPasswordResetSuccess>["confirmPasswordReset"];
	uiLayout?: UiLayout;
}

export const ForgottenPasswordResetSuccessUi = ({
	isActive,
	confirmPasswordReset,
	uiLayout = "MOUNT_WHEN_ACTIVE",
}: ForgottenPasswordResetSuccessUiProps) => {
	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.ForgottenPasswordResetSuccess}
				isLoading={false}
				description={description}
				errorMsg="n/a"
			/>
			<Form submitCb={confirmPasswordReset}>
				<Form.Elements disabled={!isActive}>
					<Form.Controls>
						<Form.Submit label={controlLabels.confirm} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
}

export const ForgottenPasswordResetSuccess = () => {
	const { isActive, confirmPasswordReset } = useForgottenPasswordResetSuccess();
	const { uiLayout } = useConfigState();

	return (
		<ForgottenPasswordResetSuccessUi
			isActive={isActive}
			confirmPasswordReset={confirmPasswordReset}
			uiLayout={uiLayout}
		/>
	);
};
