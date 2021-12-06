import { AuthStateId, machine } from "@thingco/authentication-core";
import assert from "assert";
import { suite } from "uvu";



const sanityChecks = suite("sanity checks for the overall auth system");

sanityChecks("should have an id of 'authSystem'", () => {
	assert.equal(machine.id, "authSystem");
});

sanityChecks("should have within the machine definition all states defined in the AuthState enum", () => {
	// The ids will be prefixed with the machine id, hence the previous
	// sanity check test. Strip those, then filter to remove any empty
	// strings remaining (one of the stateIds will just be "authSystem"):
	const statesDefinedInMachine = machine.stateIds
		.map((id) => id.replace(/authSystem.?/, ""))
		.filter((id) => id)
		.sort();
	const statesDefinedInEnum = Object.values(AuthStateId).sort();

	assert.deepStrictEqual(statesDefinedInMachine, statesDefinedInEnum);
});

sanityChecks("should start in an initial state of 'CheckingForSession'", () => {
	assert.equal(machine.initial, AuthStateId.CheckingSession);
});

sanityChecks.run();
