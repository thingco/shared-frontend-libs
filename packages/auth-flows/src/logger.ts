import { authSystem, AuthSystemContext, AuthSystemEvents } from "./authentication-system";

import type { State, StateValue, Subscription } from "xstate";

const isBrowser = new Function("try {return this===window;}catch(e){ return false;}");

function reify<T = Record<string, unknown>>(obj: T): T | string {
	if (isBrowser) {
		return JSON.parse(JSON.stringify(obj));
	} else {
		// We are looking at logs in a Node terminal
		return `[use browser debugger to view] ${JSON.stringify(obj).substr(0, 20)}...`;
	}
}

// prettier-ignore
type AuthSystemLoggableState = State<AuthSystemContext, AuthSystemEvents, any, { value: any; context: AuthSystemContext; }>

export class AuthSystemLogger {
	childSubscriptions: Record<string, Subscription> = {};
	currentAuthSystemState: StateValue | null = null;
	id: string;
	isWorker: boolean;

	constructor(id: string, isWorker = false) {
		this.id = id;
		this.isWorker = isWorker;
		// for crying out loud, need to bind all of the methods because in this case,
		// as soon as I use any of the methods in a subscription, `this` vanishes.
		this.updateChildSubscriptions = this.updateChildSubscriptions.bind(this);
		this.log = this.log.bind(this);
	}

	updateChildSubscriptions(s: AuthSystemLoggableState) {
		const currentSubscriptions = Object.keys(this.childSubscriptions);
		const currentChildren = Object.keys(s.children);

		const removedSubscriptions = currentSubscriptions.filter((k) => !currentChildren.includes(k));
		const addedSubscriptions = currentChildren.filter((k) => !currentSubscriptions.includes(k));

		removedSubscriptions.forEach((subKey) => {
			this.childSubscriptions[subKey].unsubscribe();
			delete this.childSubscriptions[subKey];
		});

		addedSubscriptions.forEach((subKey) => {
			const logger = new AuthSystemLogger(subKey, true);
			this.childSubscriptions[subKey] = s.children[subKey].subscribe(logger.log);
		});
	}

	log(s: AuthSystemLoggableState) {
		this[(s.event.type as any) === "xstate.init" ? "initEventLog" : "standardEventLog"](s);
		if (!this.isWorker) this.updateChildSubscriptions(s);
	}

	get logPrefix() {
		return {
			authSystem: "[AUTH]",
			otpService: "┣━ [AUTH SERVICE: OTP]",
			usernamePasswordService: "┣━ [AUTH SERVICE: username/password]",
			pinService: "┣━ [AUTH SERVICE: PIN]",
			biometricService: "┣━ [AUTH SERVICE: biometric]",
		}[this.id];
	}

	get logIndent() {
		if (isBrowser || this.id === "authSystem") return "";
		return "    ";
	}

	get serviceInfo() {
		// prettier-ignore
		return {
			"authSystem": "Initialising overall auth system. The system acts as a supervisor for the specific services used during the authorisation process",
			"otpService": "Initialising OTP worker service. This worker handles input and validation for OTP authorisation flow",
			"usernamePasswordService": "Initialising username/password worker service. This worker handles input and validation for username/password authorisation flow",
			"pinService": "Initialising PIN worker service. This worker handles device-level PIN security",
			"biometricService": "Initialising biometric worker service. This worker handles device-level biometric security"
		}[this.id];
	}

	initEventLog(s: AuthSystemLoggableState) {
		console.groupCollapsed("%s%s %s", this.logIndent, this.logPrefix, this.serviceInfo);
		console.log("%s◼ event details", this.logIndent, reify(s.event));
		console.log("%s↓ next state", this.logIndent, reify(s));
		console.groupEnd();
	}

	standardEventLog(s: AuthSystemLoggableState) {
		// prettier-ignore
		console.groupCollapsed("%s%s %s", this.logIndent, this.logPrefix, s.event.type);
		console.log("%s↑ prev state", this.logIndent, reify(s.history));
		console.log("%s◼ event details", this.logIndent, reify(s.event));
		console.log("%s↓ next state", this.logIndent, reify(s));
		console.groupEnd();
	}
}
