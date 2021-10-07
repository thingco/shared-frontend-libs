# Developing against a test app

## Overview

Assuming Yarn is being used, a package that has a `test-app/` subdirectory containing a react app will have the app built on watch mode so a developer has a visual representation to work against.

> **NOTE** this is currently only for web apps, the script needs work to allow for Expo test apps.

## How it works

See [the `build-single-package` script for details](./build-single-package.md).

Unlike build, which is a one-off designed to construct the output prior to publishing, when script runs it:

- runs `esbuild` to produce bundled JS output in-memory, using the `serve` API,
- which opens a web server at localhost:3000,
- page reloads every time files change.

Note that hot reloading is not supported by ESBuild: it simply refreshes every time.

## Setup

1. In the package you want a test app, add a `test-app/`
2. In that folder, add a `public/` directory. Add an `index.html` and whatever else should be public (CSS, favicon to stop the browser screaming that there isn't one, etc etc).
3. JS/TS Code for the app should go directly into the `test-app/` folder, so you'll need an `index.tsx` at the very least.
4. There should be a `tsconfig.build.json`, make sure only `src` is scoped in there -- the main `tsconfig.json` should already include `test-app` as one of the root directories.
5. In the `package.json`, add `"start": "yarn global:start"` to the `"scripts"` field.
6. Run `yarn workspace @thingco/my-package start` and a server should start up, serving at localhost:3000.

## Imports

```js
import { build, serve } from "esbuild";
import { createServer, request } from "http";
import { join } from "path";
import { spawn } from "child_process";
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

NOTE: the server functionality is a modified version of one described in
[this ESBuild issue thread](https://github.com/evanw/esbuild/issues/802#issuecomment-819578182).



```js
prepLog(`Starting watch of ${name} test implementation on port ${PORT}`);

const clients = [];

const buildConfig = {
	bundle: true,
	entryPoints: [join(workspaceSourceDirectoryPath, "index.tsx")],
	outfile: join(workspaceOutDirectoryPath, "index.js"),
	banner: {
		js: `;(() => new EventSource("/esbuild").onmessage = () => location.reload())();`
	},
	sourcemap: true,
	tsconfig: join(workspacePath, "tsconfig.json"),
	watch: {
		onRebuild(error, result) {
			clients.forEach((res) => res.write("data: update\n\n"))
			clients.length = 0
			console.log(error ? error : "...")
		},
	}
};

build(buildConfig).catch((err) => {
	errLog(err.message);
	errLog(err.stack);
	process.exit(1);
});

serve({ servedir: workspaceOutDirectoryPath }, {}).then(() => {
	createServer((req, res) => {
		const { url, method, headers } = req;

		if (req.url === "/esbuild") {
			return clients.push(
				res.writeHead(200, {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				})
			);
		}

		const path = ~url.split("/").pop().indexOf(".") ? url : `/index.html`; //for PWA with router

		req.pipe(
			request({ hostname: "0.0.0.0", port: 8000, path, method, headers }, (prxRes) => {
				res.writeHead(prxRes.statusCode, prxRes.headers);
				prxRes.pipe(res, { end: true });
			}),
			{ end: true }
		);
	}).listen(3000);

	setTimeout(() => {
		const op = { darwin: ['open'], linux: ['xdg-open'], win32: ['cmd', '/c', 'start'] }
		const ptf = process.platform
		if (clients.length === 0) spawn(op[ptf][0], [...[op[ptf].slice(1)], `http://localhost:3000`])
	}, 1000) //open the default browser only if it is not opened yet
});
```
