import React from "react";
import { c } from "compress-tag";

import { resetPinCb } from "./callback-implementations";
import { useConfigState } from "../ConfigInjector";
import { AuthStateId } from "../../auth-system";
import { useForgottenPinRequestingReset } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
If an unauthenticated user using PIN security has forgotten their PIN,
they can request a reset. If they choose to continue, then the existing
PIN is cleared. However, for security, they are also logged out, so
the auth flow moves back to the start and they must reauthenticate in full.
Once the user has agreed to reset, they cannot back out, so this stage also
allows them a chance to cancel.
`;

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
						<Form.SecondaryAction label="Cancel reset" actionCallback={cancelResetPin} />
						<Form.Submit label="Reset PIN" />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
