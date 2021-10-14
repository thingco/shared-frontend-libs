import { AuthStateId, machine } from "core/auth-system";

/* ========================================================================= *\
 * 1. SANITY CHECKS
 * 2. UTILITIES
 * 3. TESTS
\* ========================================================================= */

/* ------------------------------------------------------------------------- *\
 * 1. SANITY CHECKS
\* ------------------------------------------------------------------------- */

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

		expect(statesDefinedInMachine).toEqual(expect.arrayContaining(statesDefinedInEnum));
	});

	it("should start in an initial state of 'CheckingForSession'", () => {
		expect(machine.initial).toEqual(AuthStateId.CheckingForSession);
	});
});
