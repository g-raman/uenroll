import type { Config } from "prettier";

const config: Config = {
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  tabWidth: 2,
  printWidth: 80,
  arrowParens: "avoid",
  bracketSpacing: true,
  endOfLine: "lf",
  jsxSingleQuote: false,
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
