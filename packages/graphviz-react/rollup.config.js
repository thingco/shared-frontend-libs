import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import typescript from "rollup-plugin-typescript2";

function printBuildID(name) {
	return {
		name: "print-build-id",
		buildStart() {
			console.log(`Building ${name}`);
		},
	};
}

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
			printBuildID("@thingco/dataviz-react (dist)"),
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
			printBuildID("@thingco/dataviz-react (demo)"),
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
