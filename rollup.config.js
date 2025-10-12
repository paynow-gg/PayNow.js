import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import globals from "rollup-plugin-node-globals";
import terser from "@rollup/plugin-terser";
import inject from "@rollup/plugin-inject";
import path from "node:path";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/bundle.js",
      format: "iife",
      name: "PayNow",
      sourcemap: true,
    },
    {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
    },
  ],
  treeshake: "recommended",
  plugins: [
    resolve({ browser: true, preferBuiltins: false }),
    commonjs(),
    globals(),
    inject({
      window: path.resolve("src/stubs/window.ts"),
    }),
    typescript({
      declaration: true,
      declarationDir: "dist",
    }),
    terser(),
  ],
};
