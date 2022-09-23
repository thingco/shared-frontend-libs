# Single package builds

## Overview

Assuming Yarn is being used, bundles a package to its output `lib/` directory using ESBuild for code & the Typescript compiler for typings.

## How it works

- [Yarn](https://yarnpkg.org) is used to handle the package workspaces for the repo
- [ESBuild](https://esbuild.github.io/) is used to compile and bundle the code for each package.
- [ZX](https://github.com/google/zx) is used for Node scripts (_ie_ what you're looking at now).

So the process for this is _slightly_ convoluted, as the builds need to be ran in each package's root so that there is direct access to the package-specific configs (otherwise there needs to be quite a bit more path manipulation/checking). When that happens, the `build` command in turn needs to call this script, which is ran from the project root.

Yarn provides the tools to enable this, via the `workspace-tools` plugin.

- The `INIT_CWD` environment variable tells us the workspace that we are currently working on -- for example, `yarn workspace @thingco/auth-flows` would map to `$HOME/SomeDirectory/shared-frontend-libs/packages/auth-flows`.
- The `"build"` script in a workpace's `package.json` manifest calls the command `"global:build"`
- Colon-sperated script commands are global for the whole project, so `"global:build": "cd $INIT_CWD && zx ../../scripts/build-single-package.md"`, defined in the project root, says \_`cd` into the current workspace directory then run the script "build-single-package"

For details on the above, see _[how to share scripts between workspaces](https://yarnpkg.com/getting-started/qa#how-to-share-scripts-between-workspaces)_ in the Yarn docs.

When the script runs it:

- starts a timer,
- clears down the output directory,
- runs `tsc` to generate types (this is ran first to catch any errors),
- runs `esbuild` to produce bundled JS output,
- stops the timer, prints the duration of the build, and exits.

## Imports

```js
import { build } from "esbuild";
import { join } from "path";
import rimraf from "rimraf";
```

Logging is primitive (just basic `console.log` calls), but the different levels are coloured and formatted:

```js
import { buildLog, errLog, finLog, prepLog, warnLog } from "./scripting-utilities.mjs";
```

## Setup

`zx`, [by default, prints any shell commands](https://github.com/google/zx#verbose), this is turned off for this script

```js
$.verbose = false;
```

Use the `INIT_CWD` variable to grab the necessary paths, then in turn use that to grab info from
the package's manifest file.

```js
const workspacePath = process.env.INIT_CWD;
const workspaceManifestPath = join(workspacePath, "package.json");
const workspaceSourceDirectoryPath = join(workspacePath, "src");
const workspaceBuildDirectoryPath = join(workspacePath, "lib");

const { name, peerDependencies } = JSON.parse(
	await fs.readFile(new URL(workspaceManifestPath, import.meta.url))
);
```

Peer dependencies need to be excluded from the bundled output. ESBuild provides a setting to ignore specified dependencies, so grab the keys from the manifest if they're present.

```js
const peerDependenciesArray = Object.keys(peerDependencies ?? {});
```

## Execution

```js
try {
	prepLog(`Starting build of ${name}`);
	const start = await Date.now();
	prepLog(`Cleaning build directory at ${chalk.underline(workspaceBuildDirectoryPath)}`);
	await rimraf(workspaceBuildDirectoryPath, {}, () => void 0);

	buildLog(
		`Compiling Typescript declaration files to ${chalk.underline(
			workspaceBuildDirectoryPath + "/types/"
		)}`
	);
	await $`yarn tsc --project tsconfig.json`;
	const commonConfig = {
		bundle: true,
		entryPoints: [join(workspaceSourceDirectoryPath, "index.ts")],
		external: peerDependenciesArray,
		sourcemap: true,
		tsconfig: join(workspacePath, "tsconfig.json"),
	};

	warnLog(`ESM builds currently turned off due to publication issues.`);
	// buildLog(
	// 	`Compiling and bundling source code in ESModule format to ${chalk.underline(
	// 		workspaceBuildDirectoryPath
	// 	)}`
	// );
	// await build({
	// 	...commonConfig,
	// 	outfile: join(workspaceBuildDirectoryPath, "index.esm.js"),
	// 	format: "esm",
	// });
	buildLog(
		`Compiling and bundling source code in CJS format to ${chalk.underline(
			workspaceBuildDirectoryPath
		)}`
	);
	await build({
		...commonConfig,
		outfile: join(workspaceBuildDirectoryPath, "index.js"),
		format: "cjs",
	});

	const end = await Date.now();
	finLog(`Finished building ${name} in ${end - start}ms`);
} catch (err) {
	errLog(err.message);
	errLog(err.stack);
	process.exit(1);
}
```
