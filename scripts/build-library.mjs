import { build } from "esbuild";
import { join } from "path";
import rimraf from "rimraf";

const workspacePath = process.env.INIT_CWD;
const workspaceManifestPath = join(workspacePath, "package.json");
const workspaceSourceDirectoryPath = join(workspacePath, "src");
const workspaceBuildDirectoryPath = join(workspacePath, "lib");

const { name, peerDependencies } = JSON.parse(
	await fs.readFile(new URL(workspaceManifestPath, import.meta.url))
);

const peerDependenciesArray = Object.keys(peerDependencies ?? {});

try {
	console.log(`Starting building of ${name}`);
	const start = await Date.now();
	console.log(`Cleaning build directory at ${workspaceBuildDirectoryPath}`);
	await rimraf(workspaceBuildDirectoryPath, {}, () => void 0);
	console.log(`Compiling Typescript declaration files to ${workspaceBuildDirectoryPath}/types/`);
	await $`yarn tsc`;
	const commonConfig = {
		bundle: true,
		entryPoints: [join(workspaceSourceDirectoryPath, "index.ts")],
		external: peerDependenciesArray,
		sourcemap: true,
		tsconfig: join(workspacePath, "tsconfig.json"),
	};

	console.log(
		`Compiling and bundling source code in ESModule format to ${workspaceBuildDirectoryPath}`
	);
	await build({
		...commonConfig,
		outfile: join(workspaceBuildDirectoryPath, "index.module.js"),
		format: "esm",
	});
	console.log(`Compiling and bundling source code in CJS format to ${workspaceBuildDirectoryPath}`);
	await build({
		...commonConfig,
		outfile: join(workspaceBuildDirectoryPath, "index.js"),
		format: "cjs",
	});

	const end = await Date.now();
	console.log(`Finished building ${name} in ${end - start}ms`);
} catch (err) {
	process.exit(1);
}
