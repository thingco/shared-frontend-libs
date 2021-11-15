const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.json",
		},
	},
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
	// moduleNameMapper: {
	// 	"^@thingco/authentication-react": "<rootDir>/src/index.ts",
	// 	"^test-app/(.*)": "<rootDir>/example/$1",
	// 	"^test-utils/(.*)": "<rootDir>/test/utilities/$1",
	// },
	roots: ["<rootDir>/test/"],
	setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
	testEnvironment: "jsdom",
	transform: {
		"^.+\\.(js|ts|tsx)$": "ts-jest",
	},
	verbose: true,
};
