import React from "react";
import { AuthStateId } from "@thingco/authentication-core";
import { useAuthenticatedPinChangeSuccess } from "@thingco/authentication-react";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";


const {
	authStages: {
		authenticatedPinChangeSuccess: { description, controlLabels },
	},
} = uiText;

export const AuthenticatedPinChangeSuccess = () => {
	const { isActive, confirmPinChange } = useAuthenticatedPinChangeSuccess();
	const { uiLayout } = useConfigState();

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.AuthenticatedPasswordChangeSuccess}
				isLoading={false}
				description={description}
				errorMsg="n/a"
			/>
			<Form submitCb={confirmPinChange}>
				<Form.Elements disabled={!isActive}>
					<Form.Controls>
						<Form.Submit label={controlLabels.confirm} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
