import { useAuthState, useAuthUpdate } from "@thingco/auth-flows";
import React from "react";

export const PinFlowInit = () => {
	const { inPinFlowInitState, isLoading } = useAuthState();
	const { checkForExistingPin } = useAuthUpdate();

	return inPinFlowInitState ? (
		<section
			style={{
				opacity: inPinFlowInitState ? 1 : 0.25,
			}}
		>
			<button onClick={() => checkForExistingPin()} disabled={isLoading}>
				Check for existing pin
			</button>
		</section>
	) : null;
};
