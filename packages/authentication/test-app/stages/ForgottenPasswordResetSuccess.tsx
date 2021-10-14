import React from "react";
import uiText from "test-app/ui-copy";

import { AuthStateId } from "core/enums";
import { useForgottenPasswordResetSuccess } from "core/react/useForgottenPasswordResetSuccess";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";

const {
	authStages: {
		forgottenPasswordResetSuccess: { description, controlLabels },
	},
} = uiText;

export const ForgottenPasswordResetSuccess = () => {
	const { isActive, confirmPasswordReset } = useForgottenPasswordResetSuccess();
	const { uiLayout } = useConfigState();

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
};
