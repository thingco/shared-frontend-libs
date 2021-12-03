import { AuthError, AuthStateId } from "@thingco/authentication-core";
import { useForgottenPasswordSubmittingReset } from "@thingco/authentication-react";
import React from "react";
import { AuthStageSection, Form } from "test-app/Components";
import { UiLayout, useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";
import { submitNewPasswordCb } from "./callback-implementations";


const {
	authStages: {
		forgottenPasswordSubmittingReset: { description, controlLabels },
	},
} = uiText;

type ForgottenPasswordSubmittingResetUiProps = {
	error: AuthError;
	isActive: boolean;
	isLoading: boolean;
	validationErrors?: ReturnType<typeof useForgottenPasswordSubmittingReset>["validationErrors"];
	submitNewPassword: ReturnType<typeof useForgottenPasswordSubmittingReset>["submitNewPassword"];
	cancelPasswordReset: ReturnType<typeof useForgottenPasswordSubmittingReset>["cancelPasswordReset"];
	uiLayout?: UiLayout;
}

export const ForgottenPasswordSubmittingResetUi = ({
	error,
	isActive,
	isLoading,
	validationErrors = { code: [], newPassword: [] },
	submitNewPassword,
	cancelPasswordReset,
	uiLayout = "MOUNT_WHEN_ACTIVE",
}: ForgottenPasswordSubmittingResetUiProps) => {
	const [code, setCode] = React.useState("");
	const [newPassword, setNewPassword] = React.useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.ForgottenPasswordSubmittingReset}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={submitNewPassword} cbParams={[code, newPassword]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						id="resetCode"
						inputType="text"
						isActive={isActive}
						label={controlLabels.resetCodeInput}
						validationErrors={validationErrors["code"]}
						value={code}
						valueSetter={setCode}
					/>
					<Form.InputGroup
						id="newPassword"
						inputType="text"
						isActive={isActive}
						label={controlLabels.newPasswordInput}
						validationErrors={validationErrors["newPassword"]}
						value={newPassword}
						valueSetter={setNewPassword}
					/>
					<Form.Controls>
						<Form.Submit label={controlLabels.submitReset} />
						<Form.SecondaryAction
							label={controlLabels.resendCode}
							actionCallback={cancelPasswordReset}
						/>
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};

export const ForgottenPasswordSubmittingReset = () => {
	const { error, isActive, isLoading, validationErrors, submitNewPassword, cancelPasswordReset } =
		useForgottenPasswordSubmittingReset(submitNewPasswordCb);
	const { uiLayout } = useConfigState();

	return (
		<ForgottenPasswordSubmittingResetUi
			error={error}
			isActive={isActive}
			isLoading={isLoading}
			validationErrors={validationErrors}
			submitNewPassword={submitNewPassword}
			cancelPasswordReset={cancelPasswordReset}
			uiLayout={uiLayout}
		/>
	);
};
