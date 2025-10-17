let wasm: any | null = null;
let initPromise: Promise<any> | null = null;

export async function loadWasm() {
  if (wasm) return wasm;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const mod = await import("../../public/wasm/generator.js");
    await mod.default("/wasm/generator_bg.wasm");
    wasm = mod;
    return wasm;
  })();

  return initPromise;
}
