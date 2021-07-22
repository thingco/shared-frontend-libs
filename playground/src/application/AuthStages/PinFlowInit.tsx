import { useAuthUpdate } from "@thingco/auth-flows";
import React from "react";

export const PinFlowInit = ({ isLoading }: { isLoading: boolean }) => {
	const { checkForCurrentPin } = useAuthUpdate();

	return (
		<section>
			<button onClick={() => checkForCurrentPin()} disabled={isLoading}>
				Check for existing pin
			</button>
		</section>
	);
};
