import { AuthStateId } from "@thingco/authentication-core";
import { useAuthenticatedChangingPassword } from "@thingco/authentication-react";
import React from "react";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";
import { Optional } from "utility-types";
import { changePasswordCb } from "./callback-implementations";


const {
	authStages: {
		authenticatedChangingPassword: { description, controlLabels },
	},
} = uiText;

type AuthenticatedChangingPasswordUiProps = Optional<ReturnType<typeof useAuthenticatedChangingPassword>, "validationErrors"> & Partial<Pick<ReturnType<typeof useConfigState>, "uiLayout">>

export const AuthenticatedChangingPasswordUi = ({
	error,
	isActive,
	isLoading,
	cancelChangePassword,
	submitNewPassword,
	uiLayout = "MOUNT_WHEN_ACTIVE",
	validationErrors = { oldPassword: [], newPassword: [] },
}: AuthenticatedChangingPasswordUiProps) => {
	const [oldPassword, setOldPassword] = React.useState("");
	const [newPassword, setNewPassword] = React.useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.AuthenticatedChangingPassword}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={submitNewPassword} cbParams={[oldPassword, newPassword]}>
				<Form.Elements disabled={!isActive}>
					<Form.InputGroup
						id="oldPassword"
						inputType="text"
						isActive={isActive}
						label={controlLabels.currentPasswordInput}
						validationErrors={validationErrors["oldPassword"]}
						value={oldPassword}
						valueSetter={setOldPassword}
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
						<Form.Submit label={controlLabels.changePassword} />
						<Form.SecondaryAction
							label={controlLabels.cancelChangePassword}
							actionCallback={cancelChangePassword}
						/>
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
}

export const AuthenticatedChangingPassword = () => {
	const { error, isActive, isLoading, submitNewPassword, cancelChangePassword, validationErrors } =
		useAuthenticatedChangingPassword(changePasswordCb);
	const { uiLayout } = useConfigState();

	return (
		<AuthenticatedChangingPasswordUi
			error={error}
			isActive={isActive}
			isLoading={isLoading}
			cancelChangePassword={cancelChangePassword}
			submitNewPassword={submitNewPassword}
			uiLayout={uiLayout}
			validationErrors={validationErrors}
		/>
	);
};
