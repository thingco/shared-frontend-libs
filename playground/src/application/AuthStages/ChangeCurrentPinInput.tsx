import { useAuthState, useAuthUpdate } from "@thingco/auth-flows";
import React, { useState } from "react";

export const ChangeCurrentPinInput = () => {
	const { inChangeCurrentPinInputState, isLoading } = useAuthState();
	const { submitCurrentAndNewPin, skipPinSetup } = useAuthUpdate();

	const [localPin, setLocalPin] = useState("");
	const [localNewPin, setLocalNewPin] = useState("");

	return inChangeCurrentPinInputState ? (
		<section style={{ opacity: inChangeCurrentPinInputState ? 1 : 0.25 }}>
			<input
				type="text"
				value={localPin}
				onChange={(e) => setLocalPin(e.target.value)}
				disabled={!inChangeCurrentPinInputState}
			/>
			<input
				type="text"
				value={localNewPin}
				onChange={(e) => setLocalNewPin(e.target.value)}
				disabled={!inChangeCurrentPinInputState}
			/>
			<button onClick={() => submitCurrentAndNewPin(localPin, localNewPin)} disabled={isLoading}>
				Submit pin
			</button>

			<button onClick={() => skipPinSetup()}>Skip pin setup</button>
		</section>
	) : null;
};
