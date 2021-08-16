import React from "react";

import { AuthenticationSystemContext } from "../authentication-system";
import {
	AuthenticationSystem,
	useAuthenticationSystem,
	useAuthenticationSystemState,
	useLoginSystemEvent,
} from "../AuthenticationSystem";
import { cognitoAuthSystem } from "./setup";

const InterpreterTest = () => {
	const interpreter = useAuthenticationSystem();

	return (
		<>
			<p>Using the interpreter directly:</p>
			<ul>
				<li>Initialised? {JSON.stringify(interpreter.initialized)}</li>
				<li>Existing children? {JSON.stringify(interpreter.children)}</li>
			</ul>
		</>
	);
};

const ActorTest = () => {
	const state = useAuthenticationSystemState();

	return (
		<>
			<p>Using the actor:</p>
			<ul>
				<li>State value? {JSON.stringify(state.value)}</li>
				<li>Login System? {JSON.stringify(state.context as AuthenticationSystemContext)}</li>
			</ul>
		</>
	);
};

const SessionCheck = () => {
	const { checkSession } = useLoginSystemEvent();

	return <button onClick={() => checkSession()}>Check Session</button>;
};

export const App = () => (
	<AuthenticationSystem authenticationSystem={cognitoAuthSystem} inWebDebugMode={true}>
		<InterpreterTest />
		<ActorTest />
		<SessionCheck />
		<p>Hi</p>
	</AuthenticationSystem>
);
