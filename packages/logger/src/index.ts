/* eslint-disable @typescript-eslint/no-explicit-any */
export type LoggerImplementation = {
	info: (...args: any[]) => void;
	log: (...args: any[]) => void;
	warn: (...args: any[]) => void;
	error: (...args: any[]) => void;
};

/**
 * Factory function for creating a `useLogger` hook.
 */
export function createLogger(implementation: LoggerImplementation) {
	return () => implementation;
}

/**
 * Default implementation, just using `console` functions.
 */
export const useLogger = createLogger({
	info: console.info,
	log: console.log,
	warn: console.warn,
	error: console.error,
});
