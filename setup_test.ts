import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("setup check", () => {
  const x = 1 + 2;
  assertEquals(x, 3);
});

Deno.test("environment check", () => {
  console.log("Deno version:", Deno.version.deno);
  assertEquals(typeof Deno.version.deno, "string");
});
