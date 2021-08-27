import { useAuthUpdate } from "@thingco/auth-flows";
import React from "react";

export const UsernameAndPasswordLoginFlowInit = ({ isLoading }: { isLoading: boolean }) => {
	const { runSessionCheck } = useAuthUpdate();

	return (
		<section>
			<button onClick={() => runSessionCheck()} disabled={isLoading}>
				Check session
			</button>
		</section>
	);
};
