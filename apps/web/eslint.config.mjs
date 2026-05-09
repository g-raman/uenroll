import { config as reactConfig } from "@repo/eslint-config/react-internal";
import { globalIgnores } from "eslint/config";

/** @type {import("eslint").Linter.Config} */
export default [
  ...reactConfig,
  {
    rules: {
      "react/prop-types": "off",
    },
  },
  globalIgnores([
    "./.next/",
    "./.output/",
    "./.tanstack/",
    "./.turbo/",
    "./node_modules/",
    "./public/wasm/",
    "./src/routeTree.gen.ts",
    "./worker-configuration.d.ts",
  ]),
];
