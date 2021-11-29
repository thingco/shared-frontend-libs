import { AuthError, AuthStateId } from "@thingco/authentication-core";
import { useForgottenPinRequestingReset } from "@thingco/authentication-react";
import React from "react";
import { AuthStageSection, Form } from "test-app/Components";
import { UiLayout, useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";
import { resetPinCb } from "./callback-implementations";

const {
	authStages: {
		forgottenPinRequestingReset: { description, controlLabels },
	},
} = uiText;

type ForgottenPinRequestingResetUiProps = {
	error: AuthError;
	isActive: boolean;
	isLoading: boolean;
	resetPin: ReturnType<typeof useForgottenPinRequestingReset>["resetPin"];
	cancelResetPin: ReturnType<typeof useForgottenPinRequestingReset>["cancelResetPin"];
	uiLayout?: UiLayout;
}

export const ForgottenPinRequestingResetUi = ({
	error,
	isLoading,
	isActive,
	resetPin,
	cancelResetPin,
	uiLayout = "MOUNT_WHEN_ACTIVE",
}: ForgottenPinRequestingResetUiProps) => {
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

export const ForgottenPinRequestingReset = () => {
	const { error, isActive, isLoading, resetPin, cancelResetPin } =
		useForgottenPinRequestingReset(resetPinCb);
	const { uiLayout } = useConfigState();

	return (
		<ForgottenPinRequestingResetUi
			error={error}
			isActive={isActive}
			isLoading={isLoading}
			resetPin={resetPin}
			cancelResetPin={cancelResetPin}
			uiLayout={uiLayout}
		/>
	);

};
