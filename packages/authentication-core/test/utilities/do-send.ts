import type { AuthEvent, AuthInterpreter } from "@thingco/authentication-core";

/**
 * XState's `test` package requires defining a test model (System Under Test),
 * then providing a mapping of events in the SUT to events in the actual model.
 * To make this less onerous, this utility function just requires the actual
 * event to be sent passed in:
 */
export function doSend(e: AuthEvent) {
	return {
		exec: ({ send }: AuthInterpreter) => send(e),
	} as any;
}
