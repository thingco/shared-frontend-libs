import { useAuthState, useAuthUpdate } from "@thingco/auth-flows";

export const Authorised = () => {
	const { inAuthorisedState } = useAuthState();
	const { logOut } = useAuthUpdate();

	return inAuthorisedState ? (
		<section>
			<h1>Logged in stuff!</h1>
			<button onClick={() => logOut()}>Log out</button>
		</section>
	) : null;
};
