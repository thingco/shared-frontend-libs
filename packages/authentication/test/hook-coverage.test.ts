import { AuthStateId } from "core/enums";
import { AuthHook } from "./hooks";

/* ------------------------------------------------------------------------- *\
 * 1. UTILITIES
\* ------------------------------------------------------------------------- */

/**
 * Every exposed state (which describe a stage in the auth process), has
 * a corresponding hook, which handles sending messages to the system.
 *
 * Every exposed state is PascalCase.
 *
 * So
 *
 * @example
 * ```
 * > stateIdToHookName("CheckingForSession")
 * "useCheckingForSession"
 * ```
 */
function stateIdToHookName(stateId: AuthStateId) {
	return `use${stateId}`;
}

/**
 * Internal states are simply prefixed with "INTERNAL". They aren't exposed
 * to users and don't have corresponding hooks, so need to be excised from
 * the (user-facing) hook tests.
 *
 * @example
 * ```
 * > stateIsUserFacing("INTERNAL__loginFlowCheck")
 * false
 * > stateIsUserFacing("CheckingForSession")
 * true
 * ```
 */
function stateIsUserFacing(stateId: AuthStateId) {
	return !stateId.startsWith("INTERNAL");
}

/* ------------------------------------------------------------------------- *\
 * 2. TESTS
\* ------------------------------------------------------------------------- */

describe("sanity checks for the auth system hooks", () => {
	it("module exports a hook for each state that is not internal to the machine, and only that", () => {
		const nonInternalMachineStatesAsHookNames = Object.values(AuthStateId)
			.filter(stateIsUserFacing)
			.map(stateIdToHookName);

		const actualExportedHookNames = Object.keys(AuthHook);

		expect(nonInternalMachineStatesAsHookNames).toEqual(
			expect.arrayContaining(actualExportedHookNames)
		);
	});
});
