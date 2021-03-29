module.exports = {
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.jest.json",
		},
	},
	// preset: "ts-jest",
	roots: ["<rootDir>/src"],
	testEnvironment: "jsdom",
	testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
	// transform: {
	// 	".(ts|tsx)": require.resolve("ts-jest"),
	// },
	verbose: true,
};
