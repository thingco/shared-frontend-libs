# Creating a new project

> This is a stub at the minute, please expand this guide

## Overview

In an attempt to get some consistency, this is a guide to creating a brand-new front-end project. Having a set of common conventions should help with navigating across repositories and onboarding new developers.

## Structure

```
my-project/
  |_ docs/
  |_ scripts/
  |_ packages/
  |    |_ package-1/
  |    |    |_ src/
  |    |    |_ package.json
  |         |_ tsconfig.json
  |    |_ package-2/
  |         |_ src/
  |         |_ package.json
  |         |_ tsconfig.json
  |_ package.json
  |_ tsconfig.json
```

## Root Setup

```
mkdir new-project
cd new-project
yarn init -y
mkdir packages
```

Yarn is used because of its built-in support for monorepos and plug-and-play architecture. The package.json needs to be amended:

```json
{
  "name": "new-project",
  "description": "description of new project"
  "author": "ThingCo",
  "contributors": [
    { "name": "Some contributor", "email": "some.contributor@thingco.com" }
  ],
  "private": true,
  "workspaces": ["packages/*"]
}
```

Nothing else should currently be needed here: the actual project will be in a folder/folders under `packages/`. Note that it is set as `private` even if some/all of the packages are public.

Install yarn 2 and yarn plugins:

```
yarn set version berry
yarn set version latest
yarn plugin import workspace-tools
yarn plugin import interactive-tools
yarn plugin import typescript
yarn plugin import version
```

### Development tooling

Typescript:

```
yarn add -D typescript
```

Add a global alias for compiling (SEE NOTE IN YARN DOCS ABOUT HOW THIS WORKS):

```json
...snip,
"scripts": {
  "global:compile": "cd $INIT_CWD && tsc --build",
  "global:typecheck": "cd $INIT_CWD && tsc --noEmit",
},
```

Add a base `tsconfig.json` that all other tsconfigs will inherit from:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ES2015", "ES2016", "ES2017", "ES2019", "ES2020" "ESNext", "DOM"], /* REVIEW this is hugely overspecified */
    "incremental": true, /* REVIEW optional, but getting this right massively speeds up compilation */
    "declaration": true,
    "declarationMap": true,
    "jsx": "react",
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

> **IMPORTANT** run this to enable the yarn SDK for VSCode. Otherwise VSCode won't understand what it's looking at and the IDE tooling won't work (it'll try to look for node_modules, which doesn't exist)

```
yarn dlx @yarnpkg/pnpify --sdk vscode
```

### Testing

Jest is used for testing. It has a `projects` field in the config that can specify which collection of files to run against -- it is this that will be used for the monorepo. All tests run from the top-level directory and using globbing patterns to run tests from a specific package.

> NOTE that the ts types for Jest do need to be available in the individual packages -- commands run in a workspace run from that workspace folder, so without the types Jest will fail

```
yarn add -D jest ts-jest @types/jest
yarn ts-jest config:init
```

> I'll come back to this once I have some workspaces initialised.

### Linting/formatting

~Using Rome.~

```
yarn add -D rome
yarn rome init
```

~Add linting to package.json:~

```json
"scripts": {
  ...snip,
  "global:lint": "cd $INIT_CWD && rome check",
}
```

~Can nest and inherit configs, so come back to that later~

> THIS FAILS, A LOT. The diagnostics are lovely, project wide-fixing would be great, but it's too unstable and it just fails without a debuggable reason more than it works. So dump Rome for Eslint

```
yarn add -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks prettier eslint-config-prettier eslint-plugin-prettier
```

Add an `.eslintrc.js` file:

```js
module.exports = {
	parser: "@typescript-eslint/parser", // Specifies the ESLint parser

	parserOptions: {
		ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
		sourceType: "module", // Allows for the use of imports
		ecmaFeatures: {
			jsx: true, // Allows for the parsing of JSX
		},
	},
	settings: {
		react: {
			version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
		},
	},
	extends: [
		"plugin:react/recommended", // Uses the recommended rules from @eslint-plugin-react
		"plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
		"prettier", // Uses eslint-config-prettier to disable ESLint rules that would conflict with prettier
		"prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
		"prettier/react", // Uses eslint-config-prettier to disable ESLint rules relating to React that would conflict with prettier
		// "plugin:prettier/recommended", // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
	],

	rules: {
		// RULES HERE
	},
};
```

Add an `.eslintignore` file:

```
.circleci
.pnp.js
.vscode
.yarn
demo
dist
lib
node_modules
```

Add a global command to the root scripts:

```
"global:lint": "cd $INIT_CWD && eslint",
```

Can adjust the rules later.

### Build utils

Add `rimraf` to handle `rm -rf` for Windows, `husky` for git hooks + `lint-staged`:

```
yarn add -D rimraf husky lint-staged
```

Add a "clean" task to the globally-available scripts, and add husky and link-staged entries to lint/format on stage.

```json
  ...snip,
  "scripts": {
    ...snip,
    "global:clean": "yarn rimraf"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,json, rjson, jsx,ts,tsx}": "yarn eslint --fix"
  }
}
```

> VERY IMPORTANT Yarn provides IDE SDKs for Eslint, Prettier and a few other tools as well as the Typescript
> one that was initialised to enable TS in VSCode. Once Eslint is installed, run:
>
> yarn dlx @yarnpkg/pnpify --sdk
>
> to enable eslint/prettier, otherwise the IDE isn't going to pick up that they're being used.

### Build tools

For libraries, going to use Rollup. I would like to just use this from root as well, but Rollup doesn't really handle monorepos particularly well. Allied to that, we also have applications, which, again, Rollup is not really designed for. So Webpack/Parcel/whatever are normally better for this purpose.

> NOTE In theory, TS-only libs can just use the TS compiler, but in practice it turns out to be simpler to use the module bundling tool for all packages.

So the module bundler/s should be installed as dev deps of individual packages.

---

## Workspaces

I'll build a few examples here. Firstly, a _public_ React library:

```
mkdir packages/dataviz && cd $_
mkdir src
yarn init -y
touch tsconfig.json
```

For consistency, I want packages prefixed under a common scope. I'm going to use @thingco for this. And it is public, and it's going to need the correct fields to specify where files will be found in the resultant published package.

```json
{
	"name": "@thingco/dataviz",
	"description": "A small data visualisation library for ThingCo React-based front ends",
	"version": "0.1.0",
	"main": "lib/index.js",
	"types": "lib/index.d.ts",
	"module": "lib/index.js",
	"public": true
}
```

```json
{
	"extends": "../../tsconfig.json",
	"compilerOptions": {
		"outDir": "./lib",
		"rootDir": "./src"
	},
	"include": ["src/**/*"],
	"exclude": ["src/**/*.test.{ts,tsx}"]
}
```

Now cd to root and make sure yarn updates its list of workspaces:

```
cd ..
yarn workspaces list
```

This should print:

```
➤ YN0000: .
➤ YN0000: packages/dataviz
➤ YN0000: Done in 0s 2ms
```

### Add package [dev|peer]dependencies and check it builds

This is a React library. It needs React as a peer dependency, and for development purposes, want to build a small example app that I can work on to create the library.

```
yarn workspace @thingco/dataviz add -D react react-dom
yarn workspace @thingco/dataviz add -P react
```

To run the demo, I will create a `demo` folder that can be built to, but which will be ignored when the package is published.

```
mkdir packages/dataviz/demo
mkdir packages/dataviz/demo/scripts
touch packages/dataviz/demo/index.html
touch packages/dataviz/demo/style.css
```

Fill in the HTML file:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>@thingco/dataviz library demo</title>
		<link rel="stylesheet" href="style.css" />
	</head>
	<body>
		<h1>Hello, World!</h1>
	</body>
</html>
```

I also need an ability to serve the demo, so I'll use `servør` for that (zero-dependency dev server)

```
yarn workspace @thingco/dataviz add -D servor
```

Then wire everything up in the package.json and check I can serve something (no build yet):

```json
  ...snip,
  "scripts": {
    "clean": "yarn global:clean lib demo/scripts",
    "serve": "yarn servor ./demo --browse --reload"
  },
  ...snip
}
```

Then

```
yarn workspace @thingco/dataviz run serve
```

The default browser should open the demo HTML page.

To get a React app up and running, will need to bundle the output. I'm using Rollup to build the library, so I might as well use it for the demo as well. I'll need Rollup itself + some plugins:

```
yarn workspace @thingco/dataviz add -D rollup @rollup/plugin-commonjs @rollup/plugin-json @rollup/plugin-node-resolve @rollup/plugin-replace rollup-plugin-peer-deps-external rollup-plugin-typescript2
```

- commonjs plugin needed to import dependencies that are exported as commonjs modules (_ie_ React)
- json plugin not sure but everything breaks if it aint there
- node resolve is to do with node imports, again, needed to allow React et al to be imported.
- replace is necessary specifically because React uses `process.env` in its codebase for build optimisation, as I'm building a browser lib this needs shimming out.
- peer deps external plugin is needed because React is not going to be packaged as a dependency, it's just expected to be present in the parent application.
- typescript2 is the de facto standard TS plugin for Rollup (thanks, package name squatters!)

More may be added later to optimise outputs, but this will do for now.

Add a Rollup config file which bundles both the library and the demo concurrently (they could be seperated for speed, but it seems simpler to just package them both up at the same time in exchange for some speed):

```js
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import typescript from "rollup-plugin-typescript2";

export default [
	{
		input: "src/index.ts",
		output: [
			{
				file: "lib/index.js",
				format: "esm",
				sourcemap: true,
			},
		],
		plugins: [
			peerDepsExternal(),
			resolve({ preferBuiltins: false, browser: true }),
			commonjs(),
			json(),
			typescript(),
		],
	},
	{
		input: "src/demo.tsx",
		output: [
			{
				file: "demo/scripts/index.js",
				format: "iife",
				sourcemap: true,
			},
		],
		plugins: [
			resolve({ preferBuiltins: false, browser: true }),
			commonjs(),
			json(),
			typescript(),
			replace({
				"process.env.NODE_ENV": JSON.stringify("production"),
			}),
		],
	},
];
```

Then add to scripts:

```json
  ...snip,
  "scripts": {
    "bundle": "yarn clean && yarn rollup -c",
    "clean": "yarn global:clean lib demo/scripts",
    "serve": "yarn servor ./demo --browse --reload"
  },
  ...snip
}
```

Adjust the demo HTML file:

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>@thingco/dataviz library demo</title>
		<link rel="stylesheet" href="style.css" />
		<script src="scripts/index.js" async></script>
	</head>
	<body>
		<div id="root"></div>
	</body>
</html>
```

I want to build and serve at the same time, so add `concurrently`

```
yarn add -D concurrently
```

Add a global command:

```json
  ...snip,
  "scripts": {
    ...snip,
    "global:concurrently": "cd $INIT_CWD && concurrently",
    ...snip
  },
  ...snip
}
```

Then run the build and serve commands in the package concurrently, adding a `develop` command that watches, rebuilds and reloads:

```
  ...snip,
  "scripts": {
    "bundle": "yarn rollup -c",
    "clean": "yarn global:clean lib demo/scripts",
    "develop": "yarn clean && yarn global:concurrently \"yarn bundle --watch\" \"yarn serve --browse --reload\"",
    "serve": "yarn servor ./demo"
  },
  ...snip
}
```

And now, running

```
yarn workspace @thingco/dataviz develop
```

Should build the project and pop open a browser window with the example app. Any changes to the code will be reflected in the browser. Not the fastest thing in the world, but it works well.

One thing that would be useful is to print which thing is being built in the console: at the minute it just says:

```
[0] src/index.ts → lib/index.js...
[0] created lib/index.js in 1.3s
[0]
[0] src/demo.tsx → demo/scripts/index.js...
[0] created demo/scripts/index.js in 2.5s
```

So I'll add a tiny plugin to log the name of the build. Rough and ready, but:

```
function printBuildID (name) {
  return {
    name: "print-build-id",
    buildStart() {
      console.log(`Building ${name}`)
    }
  }
}
```

Then I add that as the first plugin for each build, and give it a name. Now the build produces:

```
[0] bundles src/index.ts → lib/index.js...
[0] Building @thingco/dataviz (dist)
[0] created lib/index.js in 864ms
[0] bundles src/demo.tsx → demo/scripts/index.js...
[0] Building @thingco/dataviz (demo)
```

Now I port across the work from another repo to fill in this package for testing.

[here's something I did earlier...]

## Task runner

It gets a little tiresome writing out `yarn workspace do-some-thing`, and it's it's slightly cryptic. In the previous project, I used Make, but it has cross-platform issues. Instead, I'm using [just](https://github.com/casey/just), which is a Make replacement. It's extremely simple, and just runs scripts. You define a name for the script on one line followed by a colon, _eg_ `build:`). You can provide variables, _eg_ `build project:` where `project` is the variable. Variables are accessed using `{{project}}` in the script calls. Then the script calls are given in order on the next lines. So for example:

```
# bundles a single package (for example "just build @thingco/dataviz")
build package:
    @echo "Building {{package}}"
    @yarn workspace {{package}} run build
```

The first script is always the default, so I provide a `help` task that prints some useful info:

```
help:
    @echo "ThingCo shared frontend libraries"
    @echo "OS family: {{os_family()}}"
    @echo "OS: {{os()}} on {{arch()}}"
    @echo ""
    @just --list
```

Note that the `@` in front of the commands means that just doesn't print the actual command itself when it is invoked. And the comment directly before the definition is printed out when `just --list` is invoked (which displays all avalable commands).

All very simple, and means it's just that bit simpler to run everything from root.

## VSCode rules

The `.vscode` directory contains two files that configure the editor for this specific project. The `extensions.json` file means that the editr will prompt a user to install useful plugins that relate to this project. And the `settings.json` mainly provides rules that tell VSCode to use Yarn shims for the tooling SDKs (TS, ESLint, Prettier).

---

## Regarding package dependdencies

I installed common dev dependencies at the root so that they were in one place. But tbh I think this is counterproductive and complicates things. All dependencies are common in a monorepo anyway: only one version of any one package of a specific version is ever installed, and the workspace/interactive tools include utilities to ensure versioning stars correct.

By installing dev dependencies at a package level, I can avoid a lot of the shenanigans that occur when some tooling expects things to be in a specific directory. Also it will kill peer dependency warnings (for example, the rollup TS plugin complaining that TS is not present whan it actually is).

So:

- Jest at root: it is set up with different runs for different packages, no real issues there. (**REVIEW**).
- ESLint at root.
- Prettier at root.
- TS in packages _and_ at root.
- Small deps like concurrent and rimraf in packages.
- Remove global commands bar linting/testing/formatting.
