module.exports = {
	globals: {
		"ts-jest": {
			tsconfig: {
				module: "commonjs",
				target: "es2020",
			},
		},
	},
	projects: [
		{
			displayName: "@thingco/auth-flows",
			roots: ["<rootDir>/packages/auth-flows/src/"],
		},
	],
	// preset: "ts-jest",
	testEnvironment: "node",
	transform: {
		".(ts|tsx)": require.resolve("ts-jest"),
	},
	verbose: true,
};
