# Develping against a test app

## Overview

Assuming Yarn is being used, a package that has a `test-app/` (System Under Test) subdirectory will have the app contained therein built on watch mode so a developer has a visual representation to work against.

## How it works

See [the `build-single-package` script for details](./build-single-package.md).

Unlike build, which is a one-off designed to construct the output prior to publishing, when script runs it:

- runs `esbuild` to produce bundled JS output in-memory, using the `serve` API,
- which opens a web server at localhost:3000,
- and reloads that every time files change.

Note that hot reloading is not supported by ESBuild: it simply refreshes every time.

## Imports

```js
import { serve } from "esbuild";
import { join } from "path";
import rimraf from "rimraf";
```

Logging is primitive (just basic `console.log` calls), but the different levels are coloured and formatted:

```js
import { buildLog, errLog, finLog, prepLog, warnLog } from "./scripting-utilities.mjs";
```

## Setup

Set up some globals:

```js
const PORT = 3000;
```

Use the `INIT_CWD` variable to grab the necessary paths, then in turn use that to grab info from
the package's manifest file.

```js
const workspacePath = process.env.INIT_CWD;
const workspaceManifestPath = join(workspacePath, "package.json");
const workspaceSourceDirectoryPath = join(workspacePath, "src", "test-app");
const workspaceOutDirectoryPath = join(workspacePath, "src", "test-app", "www");

const { name, peerDependencies } = JSON.parse(
	await fs.readFile(new URL(workspaceManifestPath, import.meta.url))
);
```

## Execution

```js
try {
	prepLog(`Starting watch of ${name} test implementation on port ${PORT}`);
	const serveConfig = {
		port: PORT,
		// host?: string;
		servedir: workspaceOutDirectoryPath,
		// onRequest?: (args: ServeOnRequestArgs) => void;
	};
	const buildConfig = {
		bundle: true,
		entryPoints: [join(workspaceSourceDirectoryPath, "index.tsx")],
		outfile: join(workspaceOutDirectoryPath, "index.js"),
		sourcemap: true,
		tsconfig: join(workspacePath, "tsconfig.json"),
	};
	await serve(serveConfig, buildConfig);
} catch (err) {
	errLog(err.message);
	errLog(err.stack);
	process.exit(1);
}
```
