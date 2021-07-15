import { useAuthState, useAuthUpdate } from "@thingco/auth-flows";
import React from "react";

export const PinFlowInit = () => {
	const { inPinFlowInitState, isLoading } = useAuthState();
	const { checkForCurrentPin } = useAuthUpdate();

	return inPinFlowInitState ? (
		<section
			style={{
				opacity: inPinFlowInitState ? 1 : 0.25,
			}}
		>
			<button onClick={() => checkForCurrentPin()} disabled={isLoading}>
				Check for existing pin
			</button>
		</section>
	) : null;
};
