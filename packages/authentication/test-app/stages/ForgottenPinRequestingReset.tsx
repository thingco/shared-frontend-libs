import React from "react";
import uiText from "test-app/ui-copy";

import { AuthStateId } from "core/auth-system";
import { resetPinCb } from "./callback-implementations";
import { useForgottenPinRequestingReset } from "core/react/useForgottenPinRequestingReset";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";

const {
	authStages: {
		forgottenPinRequestingReset: { description, controlLabels },
	},
} = uiText;

export const ForgottenPinRequestingReset = () => {
	const { error, isActive, isLoading, resetPin, cancelResetPin } =
		useForgottenPinRequestingReset(resetPinCb);
	const { uiLayout } = useConfigState();

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.ForgottenPinRequestingReset}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={resetPin}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.Controls>
						<Form.SecondaryAction
							label={controlLabels.cancelReset}
							actionCallback={cancelResetPin}
						/>
						<Form.Submit label={controlLabels.resetPin} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
