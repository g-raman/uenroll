import { loadWasm } from "./wasmClient";

self.onmessage = async e => {
  const { input } = e.data;
  try {
    const mod = await loadWasm();

    const result = mod.generate_schedules_wasm(JSON.stringify(input));

    self.postMessage({ ok: true, result: JSON.parse(result) });
  } catch (_) {
    self.postMessage({
      ok: false,
      error: "Something went wrong, Please report this Error.",
    });
  }
};
