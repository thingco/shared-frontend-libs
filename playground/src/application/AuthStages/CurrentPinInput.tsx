import { useAuthState, useAuthUpdate } from "@thingco/auth-flows";
import React, { useState } from "react";

export const CurrentPinInput = () => {
	const { inCurrentPinInputState, isLoading } = useAuthState();
	const { submitCurrentPin } = useAuthUpdate();

	const [localPin, setLocalPin] = useState("");

	return inCurrentPinInputState ? (
		<section style={{ opacity: inCurrentPinInputState ? 1 : 0.25 }}>
			<input
				type="email"
				value={localPin}
				onChange={(e) => setLocalPin(e.target.value)}
				disabled={!inCurrentPinInputState}
			/>
			<button onClick={() => submitCurrentPin(localPin)} disabled={isLoading}>
				Submit pin
			</button>
		</section>
	) : null;
};
