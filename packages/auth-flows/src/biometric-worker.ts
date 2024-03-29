/* eslint-disable @typescript-eslint/no-explicit-any */
import { sendParent, StateMachine } from "xstate";
import { createModel, ModelContextFrom, ModelEventsFrom } from "xstate/lib/model";

import { ServiceError } from "./errors";

import type { DeviceSecurityService } from "./types";

const model = createModel(
	{},
	{
		events: {
			AUTHORISE_AGAINST_BIOMETRIC_SECURITY: () => ({}),
			CHECK_FOR_BIOMETRIC_SECURITY: () => ({}),
			WORKER_ASYNC_REQUEST_PENDING: () => ({}),
			WORKER_ASYNC_REQUEST_SETTLED: () => ({}),
			WORKER_AUTH_FLOW_COMPLETE: () => ({}),
			WORKER_BIOMETRIC_NOT_SUPPORTED: () => ({}),
		},
	}
);

type ModelCtx = ModelContextFrom<typeof model>;
type ModelEvt = ModelEventsFrom<typeof model>;

const implementations = {
	preserveActionOrder: true,
	services: {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		checkForBiometricSupport: (_c: ModelCtx, _e: ModelEvt) => {
			throw new ServiceError("no implemetation provided for checkForBiometricSupport method");
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		checkBiometricAuthorisation: (_c: ModelCtx, _e: ModelEvt) => {
			throw new ServiceError("no implemetation provided for checkBiometricAuthorisation method");
		},
	},
	actions: {
		// Keep in touch with yr parents
		notifyAuthFlowComplete: sendParent(model.events.WORKER_AUTH_FLOW_COMPLETE),
		notifyBiometricUnsupported: sendParent(model.events.WORKER_BIOMETRIC_NOT_SUPPORTED),
		notifyRequestComplete: sendParent(model.events.WORKER_ASYNC_REQUEST_SETTLED),
		notifyRequestStarted: sendParent(model.events.WORKER_ASYNC_REQUEST_PENDING),
	},
};

const machine = model.createMachine(
	{
		id: "biometricService",
		initial: "checkingForBiometricSupport",
		context: model.initialContext,
		states: {
			checkingForBiometricSupport: {
				on: {
					CHECK_FOR_BIOMETRIC_SECURITY: {
						target: "biometricSupportCheck",
					},
				},
			},
			biometricSupportCheck: {
				entry: "notifyRequestStarted",
				invoke: {
					id: "checkForBiometricSupport",
					src: "checkForBiometricSupport",
					onDone: {
						target: "biometricAuthorisationCheck",
					},
					onError: {
						actions: "notifyBiometricUnsupported",
						target: "biometricUnsupported",
					},
				},
				exit: "notifyRequestComplete",
			},
			awaitingRequestForBiometricAuthorisation: {
				on: {
					AUTHORISE_AGAINST_BIOMETRIC_SECURITY: {
						target: "biometricAuthorisationCheck",
					},
				},
			},
			biometricAuthorisationCheck: {
				entry: "notifyRequestStarted",
				invoke: {
					id: "checkBiometricAuthorisation",
					src: "checkBiometricAuthorisation",
					onDone: {
						target: "authorised",
					},
					onError: {
						target: "awaitingRequestForBiometricAuthorisation",
					},
				},
				exit: "notifyRequestComplete",
			},
			authorised: {
				entry: "notifyAuthFlowComplete",
			},
			biometricUnsupported: {
				entry: "notifyBiometricUnsupported",
			},
		},
	},
	implementations
);

export function createBiometricWorker(
	serviceApi: DeviceSecurityService
): StateMachine<ModelContextFrom<typeof model>, any, ModelEventsFrom<typeof model>> {
	return machine.withConfig({
		services: {
			checkForBiometricSupport: () => serviceApi.checkForBiometricSupport(),
			checkBiometricAuthorisation: () => serviceApi.checkBiometricAuthorisation(),
		},
	});
}
