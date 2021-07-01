import { build } from "esbuild";

try {
	await build({
		bundle: true,
		entryPoints: ["src/index.ts"],
		external: ["@xstate/react", "react", "react-dom", "xstate"],
		outfile: "lib/index.js",
		sourcemap: true,
	});
} catch {
	process.exit(1);
}
