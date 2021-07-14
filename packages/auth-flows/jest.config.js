module.exports = {
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.jest.json",
		},
	},
	roots: ["<rootDir>/src"],
	testEnvironment: "jsdom",
	testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
	transform: {
		"^.+\\.(js|ts|tsx)$": "ts-jest",
	},
	verbose: true,
};
