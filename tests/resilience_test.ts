import "./test_setup.ts";
import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("Resilience - Missing DOM Elements", async () => {
  // Temporarily break document.getElementById
  const originalGetElementById = document.getElementById;
  document.getElementById = () => null;

  try {
    const { TacticalMap } = await import("../app.js");
    const map = new TacticalMap(10, 10);

    // Should not throw, and should have mock container
    assertExists(map.container);
    assertExists(map.statusDisplay);

    // Should be safe to call methods that use these
    map.log("Test log"); // Should not crash
    map.render(); // Should not crash
  } finally {
    // Restore
    document.getElementById = originalGetElementById;
  }
});

Deno.test("Resilience - Invalid Scenario", async () => {
  const { TacticalMap } = await import("../app.js");
  const map = new TacticalMap(10, 10);

  // Mock SCENARIOS global to include a bad scenario
  const badScenarioKey = "broken_scenario";
  // @ts-ignore: Global access
  globalThis.SCENARIOS[badScenarioKey] = {
    name: "Broken",
    // Missing attacker/defender
  };

  map.generate(badScenarioKey);

  // Should have aborted generation, so currentScenario should be null or unchanged
  // Note: generate() sets currentScenario to null at start, so it should be null if validation fails
  // Wait, generate() sets this.currentScenario = scenario ONLY if valid.
  // But it also resets it at the top.

  // Actually, looking at code:
  // this.currentScenario = null; (at start of generate)
  // ... validation ...
  // if (valid) this.currentScenario = scenario;

  assertEquals(map.currentScenario, null);
});

Deno.test("Resilience - Deprecated Victory Method", async () => {
  const { TacticalMap } = await import("../app.js");
  const map = new TacticalMap(10, 10);

  const oldScenarioKey = "old_school";
  // @ts-ignore: Global access
  globalThis.SCENARIOS[oldScenarioKey] = {
    name: "Old School",
    attacker: {},
    defender: {},
    victory: () => "Old Victory",
  };

  map.generate(oldScenarioKey);

  assertExists(map.currentScenario);
  assertExists(map.currentScenario.checkVictory);
  assertEquals(map.currentScenario.checkVictory(), "Old Victory");
});
