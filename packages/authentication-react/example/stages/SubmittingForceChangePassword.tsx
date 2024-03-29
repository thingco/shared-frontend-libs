import { AuthStateId } from "@thingco/authentication-core";
import { useSubmittingForceChangePassword } from "@thingco/authentication-react";
import React, { useState } from "react";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";
import { validateForceChangePasswordCb } from "./callback-implementations";
import type { Optional } from "utility-types";

const {
	authStages: {
		submittingForceChangePassword: { description, controlLabels },
	},
} = uiText;

type SubmittingForceChangePasswordUiProps = Optional<ReturnType<typeof useSubmittingForceChangePassword>, "validationErrors"> & Partial<Pick<ReturnType<typeof useConfigState>, "uiLayout">>;

export const SubmittingForceChangePasswordUi = ({
	error,
	isLoading,
	isActive,
	validationErrors = {password: []},
	validateNewPassword,
	uiLayout = "MOUNT_WHEN_ACTIVE",
}: SubmittingForceChangePasswordUiProps) => {
	const [password, setPassword] = useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.SubmittingForceChangePassword}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={validateNewPassword} cbParams={[password]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						id="password"
						inputType="text"
						isActive={isActive}
						label={controlLabels.newPasswordInput}
						validationErrors={validationErrors.password}
						value={password}
						valueSetter={setPassword}
					/>
					<Form.Controls>
						<Form.Submit label={controlLabels.submitPassword} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};

export const SubmittingForceChangePassword = () => {
	const { error, isLoading, isActive, validationErrors, validateNewPassword } =
		useSubmittingForceChangePassword(validateForceChangePasswordCb);
	const { uiLayout } = useConfigState();

	return (
		<SubmittingForceChangePasswordUi
			error={error}
			isLoading={isLoading}
			isActive={isActive}
			validationErrors={validationErrors}
			validateNewPassword={validateNewPassword}
			uiLayout={uiLayout}
		/>
	);
};
