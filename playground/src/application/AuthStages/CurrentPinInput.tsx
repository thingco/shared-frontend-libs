import { useAuthUpdate } from "@thingco/auth-flows";
import React, { useState } from "react";

export const CurrentPinInput = ({ isLoading }: { isLoading: boolean }) => {
	const { submitCurrentPin } = useAuthUpdate();

	const [localPin, setLocalPin] = useState("");

	return (
		<section>
			<input
				type="email"
				value={localPin}
				onChange={(e) => setLocalPin(e.target.value)}
				disabled={isLoading}
			/>
			<button onClick={() => submitCurrentPin(localPin)} disabled={isLoading}>
				Submit pin
			</button>
		</section>
	);
};
