import { useAuthState, useAuthUpdate } from "@thingco/auth-flows";
import React, { useState } from "react";

export const OtpLoginFlowInit = () => {
	const { inOtpLoginFlowInitState, isLoading } = useAuthState();
	const { runSessionCheck } = useAuthUpdate();

	return inOtpLoginFlowInitState ? (
		<section
			style={{
				opacity: inOtpLoginFlowInitState ? 1 : 0.25,
			}}
		>
			<button onClick={() => runSessionCheck()} disabled={isLoading}>
				Check session
			</button>
		</section>
	) : null;
};
