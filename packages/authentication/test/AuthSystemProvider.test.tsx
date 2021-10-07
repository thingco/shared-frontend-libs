/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import React from "react";
import { render } from "@testing-library/react";

// Import the entire authentication structure from the test app:
import { Authentication } from "test-app/App";
// Import the config injection component from the test app:
import { ConfigInjector } from "test-app/ConfigInjector";
// Local storage mock:
import { localStorageMock } from "./utilities";
// Test models:
import { otpNoPin } from "./models/otp-no-pin";
import { usernamePasswordNoPin } from "./models/username-password-no-pin";

/* ------------------------------------------------------------------------- *\
 * 1. MOCKING
\* ------------------------------------------------------------------------- */

// jest.mock("test-app/stages/callback-implementations");

/* ------------------------------------------------------------------------- *\
 * 2. TESTS
\* ------------------------------------------------------------------------- */

describe("authentication test system using OTP and no device security", () => {
	beforeAll(() => {
		globalThis.localStorage = localStorageMock();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	const testPlans = otpNoPin.model.getSimplePathPlans();

	testPlans.forEach((plan) => {
		describe(`authentication test system ${plan.description}`, () => {
			plan.paths.forEach((path) => {
				it(path.description, async () => {
					const screen = render(
						<ConfigInjector
							initialLoginFlowType="OTP"
							initialDeviceSecurityType="NONE"
							isInTestMode={true}
						>
							<Authentication />
						</ConfigInjector>
					);
					await path.test(screen);
				});
			});
		});
	});

	it("should have full coverage", () => {
		return otpNoPin.model.testCoverage();
	});
});

describe("authentication test system using username password and no device security", () => {
	beforeAll(() => {
		globalThis.localStorage = localStorageMock();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	const testPlans = usernamePasswordNoPin.model.getSimplePathPlans();

	testPlans.forEach((plan) => {
		describe(`authentication test system ${plan.description}`, () => {
			plan.paths.forEach((path) => {
				it(path.description, async () => {
					const screen = render(
						<ConfigInjector
							initialLoginFlowType="USERNAME_PASSWORD"
							initialDeviceSecurityType="NONE"
							isInTestMode={true}
						>
							<Authentication />
						</ConfigInjector>
					);
					await path.test(screen);
				});
			});
		});
	});

	it("should have full coverage", () => {
		return usernamePasswordNoPin.model.testCoverage();
	});
});

describe("authentication test system using PIN device security", () => {
	test.todo("Add PIN security model test");
});
