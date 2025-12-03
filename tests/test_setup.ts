import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

// Mock global document
const doc = new DOMParser().parseFromString(
    `<!DOCTYPE html>
  <html>
    <body>
      <div id="battle-map"></div>
      <div id="status-text"></div>
    </body>
  </html>`,
    "text/html",
);

if (doc) {
    // @ts-ignore: Deno global augmentation
    globalThis.document = doc;
    // @ts-ignore: Deno global augmentation
    globalThis.window = globalThis;
}

// Mock SCENARIOS global if needed, or import it
// Since scenarios.js assigns to SCENARIOS const, we might need to load it or mock it.
// For now, let's try to load it via import if possible, or just mock what we need.

// We need to make sure SCENARIOS is available globally as app.js expects it
import { SCENARIOS } from "../scenarios.js";
// @ts-ignore: Global assignment
globalThis.SCENARIOS = SCENARIOS;
