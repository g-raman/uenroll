let wasm: unknown | null = null;
let initPromise: Promise<unknown> | null = null;

export async function loadWasm() {
  if (wasm) return wasm;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const mod = await import("../../public/wasm/generator.js");
    await mod.default({
      module_or_path: `${self.location.origin}/wasm/generator_bg.wasm`,
    });
    wasm = mod;
    return wasm;
  })();

  return initPromise;
}
