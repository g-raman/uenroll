import * as wasm from "./generator_bg.wasm";
export * from "./generator_bg.js";
import { __wbg_set_wasm } from "./generator_bg.js";
__wbg_set_wasm(wasm);
wasm.__wbindgen_start();
