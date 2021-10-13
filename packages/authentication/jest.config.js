// jest.config.js
const { pathsToModuleNameMapper } = require("ts-jest/utils");
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.json",
		},
	},
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
	roots: ["<rootDir>/src", "<rootDir>/test"],
	setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
	testEnvironment: "jsdom",
	testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
	transform: {
		"^.+\\.(js|ts|tsx)$": "ts-jest",
	},
	verbose: true,
};
