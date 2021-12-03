import { AuthStateId } from "@thingco/authentication-core";
import { useSubmittingCurrentPin } from "@thingco/authentication-react";
import React, { useState } from "react";
import { AuthStageSection, Form } from "test-app/Components";
import { useConfigState } from "test-app/ConfigInjector";
import uiText from "test-app/ui-copy";
import { validatePinCb } from "./callback-implementations";
import type { Optional } from "utility-types";


const {
	authStages: {
		submittingCurrentPin: { description, controlLabels },
	},
} = uiText;


type SubmittingCurrentPinUiProps = Optional<ReturnType<typeof useSubmittingCurrentPin>, "validationErrors"> & Partial<Pick<ReturnType<typeof useConfigState>, "uiLayout">>

export const SubmittingCurrentPinUi = ({
	error,
	isLoading,
	isActive,
	validatePin,
	requestPinReset,
	validationErrors = { pin: [] },
	uiLayout = "MOUNT_WHEN_ACTIVE",
}: SubmittingCurrentPinUiProps) => {
	const [pin, setPin] = useState("");

	if (uiLayout === "MOUNT_WHEN_ACTIVE" && !isActive) return null;

	return (
		<AuthStageSection isActive={isActive}>
			<AuthStageSection.Overview
				stageId={AuthStateId.SubmittingCurrentPin}
				isLoading={isLoading}
				description={description}
				errorMsg={error}
			/>
			<Form submitCb={validatePin} cbParams={[pin]}>
				<Form.Elements disabled={!isActive || isLoading} error={error}>
					<Form.InputGroup
						id="otp"
						inputType="text"
						isActive={isActive}
						label={controlLabels.pinInput}
						validationErrors={validationErrors.pin}
						value={pin}
						valueSetter={setPin}
					/>
					<Form.Controls>
						<Form.Submit label={controlLabels.submitPin} />
						<Form.SecondaryAction
							label={controlLabels.forgotPin}
							actionCallback={requestPinReset}
						/>
					</Form.Controls>
				</Form.Elements>
			</Form>
		</AuthStageSection>
	);
}
export const SubmittingCurrentPin = () => {
	const { error, isActive, isLoading, validatePin, requestPinReset, validationErrors } =
		useSubmittingCurrentPin(validatePinCb);
	const { uiLayout } = useConfigState();

	return (
		<SubmittingCurrentPinUi
			error={error}
			isActive={isActive}
			isLoading={isLoading}
			validatePin={validatePin}
			requestPinReset={requestPinReset}
			validationErrors={validationErrors}
			uiLayout={uiLayout}
		/>
	);
};
