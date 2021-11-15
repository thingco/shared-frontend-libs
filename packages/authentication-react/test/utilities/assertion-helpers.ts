import type { AuthError, DeviceSecurityType, LoginFlowType } from "@thingco/authentication-core";
import { AuthStateId } from "@thingco/authentication-core";
import assert from "assert";
import uiText from "test-app/ui-copy";
import { customScreen } from "test-utils/find-by-term";

const {
	banner: {
		meta: { term: bannerTerm },
	},
	authStages: {
		common: {
			meta: { term: authStageTerm },
		},
	},
} = uiText;

export async function currentStateIs(expected: AuthStateId) {
	return expect(
		//@ts-expect-error TS thinks that the enhanced `screen` object does not include new bound query functions
		await customScreen.findByTerm(bannerTerm.currentState)
	).toHaveTextContent(expected);
}

export async function currentLoginFlowIs(expected: LoginFlowType) {
	return expect(
		//@ts-expect-error TS thinks that the enhanced `screen` object does not include new bound query functions
		await customScreen.findByTerm(bannerTerm.currentLoginFlowType)
	).toHaveTextContent(expected);
}

export async function currentDeviceSecurityTypeIs(expected: DeviceSecurityType) {
	return expect(
		//@ts-expect-error TS thinks that the enhanced `screen` object does not include new bound query functions
		await customScreen.findByTerm(bannerTerm.currentDeviceSecurityType)
	).toHaveTextContent(expected);
}

export async function stageErrorIs(expected: AuthError | "n/a") {
	return expect(
		//@ts-expect-error TS thinks that the enhanced `screen` object does not include new bound query functions
		await customScreen.findByTerm(authStageTerm.error)
	).toHaveTextContent(expected);
}

export async function stageLoadingStatusIs(expected: "true" | "false") {
	return expect(
		//@ts-expect-error TS thinks that the enhanced `screen` object does not include new bound query functions
		await customScreen.findByTerm(authStageTerm.isLoading)
	).toHaveTextContent(expected);
}
