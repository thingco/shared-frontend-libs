import { AuthError } from "@thingco/authentication-core";
import * as assert from "assert";
import { customScreen as screen } from "test-utils/find-by-term";
import uiText from "test-app/ui-copy";

const {
	authStages: {
		common: {
			meta: { term }
		}
	}
} = uiText;

function stageErrorIs(expected: AuthError | "n/a") {
	//@ts-expect-error TS thinks that the enhanced `screen` object does not include new bound query functions
	const err = screen.getByTerm(term.error);
	assert.equal(err.textContent, expected);
}

function stageLoadingStatusIs(expected: "true" | "false") {
	//@ts-expect-error TS thinks that the enhanced `screen` object does not include new bound query functions
	const loadingStatus = screen.getByTerm(term.isLoading);
	assert.equal(loadingStatus.textContent, expected);
}

function otpAttemptsMadeIs(expected: number) {
	//@ts-expect-error TS thinks that the enhanced `screen` object does not include new bound query functions
	const otpAttemptsMade = screen.getByTerm(term.passwordAttemptsMade);
	assert.equal(parseInt(otpAttemptsMade.textContent ?? ""), expected)
}

export const CommonAssertions = {
	otpAttemptsMadeIs,
	stageErrorIs,
	stageLoadingStatusIs,
}
