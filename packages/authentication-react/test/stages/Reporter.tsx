import React from "react";
import { AuthStateId, DeviceSecurityType, LoginFlowType } from "@thingco/authentication-core";
import { useAuthProvider } from "@thingco/authentication-react";
import { customScreen as screen } from "test-utils/find-by-term";
import * as assert from "assert";
import uiText from "test-app/ui-copy";

const {
	banner: {
		meta: {
			term
		}
	},
} = uiText;

export const Reporter = () => {
	const { allowedOtpRetries, currentState, loginFlowType, deviceSecurityType, pinLength } = useAuthProvider();
	return (
		<header>
			<dl>
					<dt>{term.currentState}</dt>
					<dd>{currentState}</dd>
					<dt>{term.currentLoginFlowType}</dt>
					<dd>{loginFlowType}</dd>
					<dt>{term.currentDeviceSecurityType}</dt>
					<dd>{deviceSecurityType}</dd>
					<dt>{term.currentAllowedOtpRetries}</dt>
					<dd>{allowedOtpRetries}</dd>
					<dt>{term.currentPinLength}</dt>
					<dd>{pinLength}</dd>
			</dl>
		</header>
	);
};

export const ReporterAssertions = {
	currentStateIs(expected: AuthStateId) {
		//@ts-expect-error TS thinks that the enhanced `screen` object does not include new bound query functions
		const currentState = screen.getByTerm(term.currentState);
		return assert.equal(currentState.textContent, expected, `current state should be ${expected}`);
	},
	loginFlowIs(expected: LoginFlowType) {
		//@ts-expect-error TS thinks that the enhanced `screen` object does not include new bound query functions
		const loginFlowType = screen.getByTerm(term.currentLoginFlowType);
		return assert.equal(loginFlowType.textContent, expected, `login flow type should be ${expected}`);
	},
	deviceSecurityIs(expected: DeviceSecurityType) {
		//@ts-expect-error TS thinks that the enhanced `screen` object does not include new bound query functions
		const deviceSecurityType = screen.getByTerm(term.currentDeviceSecurityType);
		return assert.equal(deviceSecurityType.textContent, expected, `device security type should be ${expected}`);
	},
	allowedOtpRetriesIs(expected: number) {
		//@ts-expect-error TS thinks that the enhanced `screen` object does not include new bound query functions
		const allowedOtpRetries = screen.getByTerm(term.currentAllowedOtpRetries);
		return assert.equal(parseInt(allowedOtpRetries.textContent ?? ""), expected, `the maximum allowed number of OTP retries should be ${expected}`);
	},
	pinLengthIs(expected: number) {
		//@ts-expect-error TS thinks that the enhanced `screen` object does not include new bound query functions
		const pinLength = screen.getByTerm(term.currentPinLength);
		return assert.equal(parseInt(pinLength.textContent ?? ""), expected, `the PIN length should be ${expected}`);
	},
};
