import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/schema.ts", "src/queries.ts", "src/types.ts"],
  outDir: "dist",
  // Both ESM & CJS for Next.js compatibility
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  target: "es2020",
});
