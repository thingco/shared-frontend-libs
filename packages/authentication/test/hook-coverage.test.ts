import { AuthStateId } from "core/enums";

import { useAuthenticated } from "core/react/useAuthenticated";
import { useAuthenticatedChangingPassword } from "core/react/useAuthenticatedChangingPassword";
import { useAuthenticatedChangingPin } from "core/react/useAuthenticatedChangingPin";
import { useAuthenticatedLoggingOut } from "core/react/useAuthenticatedLoggingOut";
import { useAuthenticatedPasswordChangeSuccess } from "core/react/useAuthenticatedPasswordChangeSuccess";
import { useAuthenticatedValidatingPin } from "core/react/useAuthenticatedValidatingPin";
import { useCheckingForPin } from "core/react/useCheckingForPin";
import { useCheckingSession } from "core/react/useCheckingSession";
import { useForgottenPasswordRequestingReset } from "core/react/useForgottenPasswordRequestingReset";
import { useForgottenPasswordResetSuccess } from "core/react/useForgottenPasswordResetSuccess";
import { useForgottenPasswordSubmittingReset } from "core/react/useForgottenPasswordSubmittingReset";
import { useForgottenPinRequestingReset } from "core/react/useForgottenPinRequestingReset";
import { useSubmittingCurrentPin } from "core/react/useSubmittingCurrentPin";
import { useSubmittingForceChangePassword } from "core/react/useSubmittingForceChangePassword";
import { useSubmittingNewPin } from "core/react/useSubmittingNewPin";
import { useSubmittingOtp } from "core/react/useSubmittingOtp";
import { useSubmittingOtpUsername } from "core/react/useSubmittingOtpUsername";
import { useSubmittingUsernameAndPassword } from "core/react/useSubmittingUsernameAndPassword";

/**
 * The tests loop through the available hooks. This means:
 *
 * 1. can test that every exposed state in the FSM is covered with a hook.
 * 2. can generate tests from a small data structure that is looped over rather than writing a seperate test for each hook.
 *
 * To make things easier to do the above, all the hooks are given a namespace for the tests.
 *
 * This is done rather than `import * as AuthHook` to make iteration easier, nothing special.
 */
const AuthHook = {
	useAuthenticated,
	useAuthenticatedChangingPassword,
	useAuthenticatedPasswordChangeSuccess,
	useAuthenticatedChangingPin,
	useAuthenticatedLoggingOut,
	useAuthenticatedValidatingPin,
	useCheckingForPin,
	useCheckingSession,
	useSubmittingForceChangePassword,
	useForgottenPasswordRequestingReset,
	useForgottenPasswordResetSuccess,
	useForgottenPasswordSubmittingReset,
	useForgottenPinRequestingReset,
	useSubmittingCurrentPin,
	useSubmittingNewPin,
	useSubmittingOtp,
	useSubmittingOtpUsername,
	useSubmittingUsernameAndPassword,
};

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
