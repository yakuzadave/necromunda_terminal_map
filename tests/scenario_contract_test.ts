import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { SCENARIOS } from "../scenarios.js";
import { TacticalMap } from "../app.js";

// Mock map for validation context
const mockMap = {
  log: () => {},
  width: 25,
  height: 25,
  mapData: Array(25).fill(0).map(() => Array(25).fill(null)),
  getUnitsByType: () => [],
  placeEntity: () => {},
};

// deno-lint-ignore no-explicit-any
Deno.test("Scenario Contract Validation", async (t) => {
  for (const [key, rawScenario] of Object.entries(SCENARIOS)) {
    const scenario = rawScenario as any;
    await t.step(`${key} has required metadata`, () => {
      assert(scenario.name, `Scenario ${key} missing name`);
      assert(scenario.description, `Scenario ${key} missing description`);
      assert(scenario.attacker, `Scenario ${key} missing attacker config`);
      assert(scenario.defender, `Scenario ${key} missing defender config`);
    });

    await t.step(`${key} has required methods`, () => {
      assertEquals(
        typeof scenario.setup,
        "function",
        `Scenario ${key} missing setup()`,
      );
      assertEquals(
        typeof scenario.checkVictory,
        "function",
        `Scenario ${key} missing checkVictory()`,
      );

      // endPhase is optional but if present must be a function
      if (scenario.endPhase) {
        assertEquals(
          typeof scenario.endPhase,
          "function",
          `Scenario ${key} endPhase must be a function`,
        );
      }
    });
  }
});
