module.exports = {
	coverageDirectory: "<rootDir>/coverage/",
	collectCoverageFrom: ["<rootDir>/packages/*/src/**/*.{ts,tsx}"],
	projects: [
		{
			displayName: "@thingco/graphviz",
			testMatch: ["<rootDir>/packages/dataviz/src/**/*.test.{ts,tsx}"],
		},
		{
			displayName: "@thingco/graphviz-react",
			testMatch: ["<rootDir>/packages/dataviz/src/**/*.test.{ts,tsx}"],
		},
	],
	preset: "ts-jest",
	testEnvironment: "node",
};
