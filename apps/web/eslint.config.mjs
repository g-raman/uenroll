import { nextJsConfig } from "@repo/eslint-config/next-js";
import { globalIgnores } from "eslint/config";

/** @type {import("eslint").Linter.Config} */
export default [...nextJsConfig, globalIgnores(["./public/wasm/"])];
