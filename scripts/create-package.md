# Create a new package

Because Yarn opens a shell, and we want to make use of that shell when installing
packages to ensure we match the existing versions in the project, we can't use
`zx`'s command utility directly: the output of `yarn add foo` will be the string
version of the prompt, not what we want.

```js
import { spawn } from "child_process";


function installDev(packageName, ...deps) {
    const yarn = spawn(`yarn`, [`workspace`, `@thingco/${packageName}`, `add`, `-D`, ...deps], { stdio: 'inherit' });

    yarn.on(`exit`, (code) => {
        console.log(`Yarn dev dep install process exited with code ${code}`);
    });
}
```

Set up a few utilities first:

```js
const STANDARD_DEV_DEPS = ["jest", "rimraf", "ts-jest", "typedoc", "typescript"];
const STANDARD_REACT_DEV_DEPS = ["react", "react-dom", "@testing-library/jest-dom", "@testing-library/react"];
const STANDARD_REACT_PEER_DEPS = ["react", "react-dom"];
const STANDARD_REACT_NATIVE_DEV_DEPS = ["react", "react-native"];
const STANDARD_REACT_NATIVE_PEER_DEPS = ["react", "react-native"];


function createManifest (packageName, packageDescription) {
    return `{
	"name": "@thingco/${packageName}",
	"description": "${packageDescription}",
	"version": "0.1.0",
	"main": "lib/index.js",
	"types": "lib/index.d.ts",
	"files": [
		"lib/**"
	],
	"public": true,
	"publishConfig": {
		"registry": "https://npm.pkg.github.com/"
	},
	"repository": "https://github.com/thingco/shared-frontend-libs",
	"scripts": {
		"start": "yarn rimraf lib && yarn tsc --watch",
		"build": "yarn rimraf lib && yarn tsc",
		"test": "yarn jest",
		"docs": "yarn rimraf docs && yarn typedoc"
	}
}
`;
}

const tsConfig = `{
	"extends": "../../tsconfig.json",
	"compilerOptions": {
		"outDir": "./lib",
		"rootDir": "./src"
	},
	"typedocOptions": {
		"entryPoints": ["src/index.tsx"],
		"out": "docs"
	},
	"include": ["src/**/*"],
	"exclude": ["src/**/.test.{ts,tsx}"]
}
`;

const jestConfig = `module.exports = {
	globals: {
		"ts-jest": {
			tsconfig: "tsconfig.jest.json",
		},
	},
	roots: ["<rootDir>/src"],
	testEnvironment: "jsdom",
	testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
	transform: {
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
	verbose: true,
};
`

const tsConfigJest = `{
	"extends": "../../tsconfig.json",
	"compilerOptions": {
		"rootDir": "./src"
	},
	"include": ["src/**/*"]
}
`;

function createReadme (packageName) {
    return `# @thingco/${packageName}

## Overview

## Getting Started

### Prerequisites

### Installation

## Usage

## Roadmap

## Contributing

`;
}

const index = `console.log("Hello, World!");`
```

The first user action is to specify the package name. This is going to be used
to create the package folder + the package.json + any scripts that need to call
it.

```js
let packageName = await question("This package is to be called: @thingco/");
```

Validate the name, and if we're good to go, run `mkdir`. Note that we're also
creating a `src` directory at the same time as the new package.

```js
let validator = /^[a-z0-9-~][a-z0-9-._~]+$/;

if (!validator.test(packageName)) {
	throw new Error(`${packageName} is an invalid name for an NPM package.`);
}

await $`mkdir -pv packages/${packageName}/src`;
```

OK, so now we have a new package, but there's nothing in it. The `package.json`
manifest is the most important part, so we'll set up the
necessary shell of the app by getting the description first.

> REVIEW: We _could_ then ask if there are any _internal_ and _external_ peer
dependencies, but for now just create with name/description fields.

```js
let packageDescription = await question(`Describe @thingco/${packageName}: `);

await fs.writeFile(`packages/${packageName}/package.json`, createManifest(packageName, packageDescription));
await fs.writeFile(`packages/${packageName}/tsconfig.json`, tsConfig);
await fs.writeFile(`packages/${packageName}/jest.config.js`, jestConfig);
await fs.writeFile(`packages/${packageName}/tsconfig.jest.json`, tsConfigJest);
await fs.writeFile(`packages/${packageName}/README.md`, createReadme(packageName));
await fs.writeFile(`packages/${packageName}/src/index.ts`, index);
```

Now we need to add the standard dependencies for the package. Just run `yarn`
first to register this workspace:

```js
await $`yarn`;
```

Then, first checking if it's a React/React Native library, build out a list of
required dependencies:

```js
let devDeps = [];
let peerDeps = [];

let isReactNativePackage = await question(`It this a React Native package? yes or no: `, {
    choices: ["yes", "no"]
});

if (["yes", "y"].includes(isReactNativePackage.toLowerCase())) {
    devDeps = [...STANDARD_DEV_DEPS, ...STANDARD_REACT_NATIVE_DEV_DEPS];
    peerDeps = [...STANDARD_REACT_NATIVE_PEER_DEPS];
} else {
    let isReactPackage = await question(`It this a React package? yes or no: `, {
        choices: ["yes", "no"]
    });

    if (["yes", "y"].includes(isReactPackage.toLowerCase())) {
        devDeps = [...STANDARD_DEV_DEPS, ...STANDARD_REACT_DEV_DEPS];
        peerDeps = [...STANDARD_REACT_PEER_DEPS];
    } else {
        devDeps = [...STANDARD_DEV_DEPS];
        peerDeps = [];
    }
} 
```

Then finally we install everything. Installing peer dependencies requires no
input from you, so that can be executed using `xz`'s command syntax, but
then we'll use the `installDev` function to allow Yarn to present you with the
version checking options:

```js
await $`yarn workspace @thingco/${packageName} add -P ${peerDeps}`;

installDev(packageName, ...devDeps);
```