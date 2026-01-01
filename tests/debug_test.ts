import "./test_setup.ts";
import { assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("Setup Verification", () => {
  console.log("Checking document...");
  assertExists(document);
  console.log("Checking getElementById...");
  const el = document.getElementById("battle-map");
  assertExists(el);
  console.log("Setup OK");
});
