import { AuthStateId } from "@thingco/authentication-core";
import { useSubmittingOtp } from "@thingco/authentication-react";
import React, { useState } from "react";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";
import { validateOtpCb } from "./callback-implementations";


const {
	authStages: {
		submittingOtp: { description, controlLabels },
	},
} = uiText;

export const SubmittingOtp = () => {
	const { error, isActive, isLoading, validateOtp, goBack, validationErrors } =
		useSubmittingOtp(validateOtpCb);
	const { uiLayout } = useConfigState();

	const [otp, setOtp] = useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.SubmittingOtp}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={validateOtp} cbParams={[otp]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						id="otp"
						inputType="text"
						isActive={isActive}
						label={controlLabels.otpInput}
						validationErrors={validationErrors.password}
						value={otp}
						valueSetter={setOtp}
					/>
					<Form.Controls>
						<Form.Submit label={controlLabels.submitOtp} />
						<Form.SecondaryAction label={controlLabels.reenterUsername} actionCallback={goBack} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
