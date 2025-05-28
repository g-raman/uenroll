import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/schema.ts"],
  outDir: "dist",
  // Both ESM & CJS for Next.js compatibility
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  target: "es2020",
});
