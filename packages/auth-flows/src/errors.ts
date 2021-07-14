export class ServiceError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ServiceError";
	}
}

export class AuthSystemError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AuthSystemError";
	}
}
