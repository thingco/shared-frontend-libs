import React, { useState } from "react";
import { c } from "compress-tag";

import { validateOtpCb } from "./callback-implementations";
import { useConfigState } from "../ConfigInjector";
import { AuthStateId } from "../../auth-system";
import { useSubmittingOtp } from "../../react";
import { AuthStageSection, Form } from "../Components";

const description = c`
A user on OTP login flow has submitted their username, and have been sent
a one-time password. From this stage, submitting that code successfully will
result in them being authenticated. They may also move back to the username
input stage should they have mis-entered something (or just wish to resend
the code).
`;

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
						label="Enter the password you were sent"
						validationErrors={validationErrors.password}
						value={otp}
						valueSetter={setOtp}
					/>
					<Form.Controls>
						<Form.Submit label="Submit OTP" />
						<Form.SecondaryAction label="Re-enter username" actionCallback={goBack} />
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
};
