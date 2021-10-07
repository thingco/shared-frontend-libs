export default {
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.json",
		},
	},
	roots: ["<rootDir>/src"],
	setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
	testEnvironment: "jsdom",
	testMatch: ["test/**/*.(ts|tsx|js)", "src/**/*.test.(ts|tsx|js)"],
	transform: {
		"^.+\\.(js|ts|tsx)$": "ts-jest",
	},
	verbose: true,
};
