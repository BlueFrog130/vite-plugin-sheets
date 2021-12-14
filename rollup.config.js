import typescript from '@rollup/plugin-typescript'
import pkg from "./package.json";

const deps = Object.keys(pkg.dependencies || {});

export default {
	input: "src/index.ts",
	external: [...deps, "path", "vite"],
	output: [
		{ file: pkg.main, format: "cjs", sourcemap: true },
		{ file: pkg.module, format: "esm", sourcemap: true }
	],
	plugins: [typescript()]
}