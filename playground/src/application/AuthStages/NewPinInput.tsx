import { useAuthState, useAuthUpdate } from "@thingco/auth-flows";
import React, { useState } from "react";

export const NewPinInput = () => {
	const { inNewPinInputState, isLoading } = useAuthState();
	const { submitNewPin, skipPinSetup } = useAuthUpdate();

	const [localPin, setLocalPin] = useState("");

	return inNewPinInputState ? (
		<section style={{ opacity: inNewPinInputState ? 1 : 0.25 }}>
			<input
				type="email"
				value={localPin}
				onChange={(e) => setLocalPin(e.target.value)}
				disabled={!inNewPinInputState}
			/>
			<button onClick={() => submitNewPin(localPin)} disabled={isLoading}>
				Add new pin
			</button>
			<button onClick={() => skipPinSetup()}>Skip pin setup</button>
		</section>
	) : null;
};
