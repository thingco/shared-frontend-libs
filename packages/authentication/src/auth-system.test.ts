import { AuthStateId, machine } from "./auth-system";

describe("sanity checks for the overall auth system", () => {
	it("should have an id of 'authSystem'", () => {
		expect(machine.id).toEqual("authSystem");
	});

	it("should have within the machine definition all states defined in the AuthState enum", () => {
		// The ids will be prefixed with the machine id, hence the previous
		// sanity check test. Strip those, then filter to remove any empty
		// strings remaining (one of the stateIds will just be "authSystem"):
		const statesDefinedInMachine = machine.stateIds
			.map((id) => id.replace(/authSystem.?/, ""))
			.filter((id) => id);
		const statesDefinedInEnum = Object.values(AuthStateId);
		expect(statesDefinedInMachine).toEqual(statesDefinedInEnum);
	});

	it("should start in an initial state of 'awaitingSessionCheck'", () => {
		expect(machine.initial).toEqual(AuthStateId.awaitingSessionCheck);
	});
});
