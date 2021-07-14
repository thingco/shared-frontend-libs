import { build } from "esbuild";
import { join } from "path";
import rimraf from "rimraf";

// $.verbose = false;
const prepLog = (message) => console.log(chalk.magenta(`[PREPARE]	${message}`));
const buildLog = (message) => console.log(chalk.cyan(`[BUILD]		${message}`));
const finLog = (message) => console.log(chalk.green(`[COMPLETE]	${message}`));
const warnLog = (message) => console.log(chalk.yellow(`[WARN]		${message}`));
const errLog = (message) => console.log(chalk.red(`[ERROR]	${message}`));

const workspacePath = process.env.INIT_CWD;
const workspaceManifestPath = join(workspacePath, "package.json");
const workspaceSourceDirectoryPath = join(workspacePath, "src");
const workspaceBuildDirectoryPath = join(workspacePath, "lib");

const { name, peerDependencies } = JSON.parse(
	await fs.readFile(new URL(workspaceManifestPath, import.meta.url))
);

const peerDependenciesArray = Object.keys(peerDependencies ?? {});

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
	await $`yarn tsc`;
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
