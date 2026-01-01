
import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { TacticalMap } from "../app.js";
import { rng } from "../src/rng.js";

// Mock document and localStorage for Deno environment if needed
if (!globalThis.document) {
  globalThis.document = {
    getElementById: () => ({ 
        style: {}, 
        innerHTML: "", 
        appendChild: () => {},
        classList: { remove: () => {}, add: () => {} },
        offsetWidth: 0
    }),
    createElement: () => ({ 
        style: {}, 
        classList: { add: () => {} },
        addEventListener: () => {},
        dataset: {} 
    })
  };
}

Deno.test("State System - Serialization Roundtrip", () => {
    // 1. Setup Initial State
    const map = new TacticalMap(10, 10);
    // Mock container explicitly to be safe
    map.container = { style: {}, innerHTML: "", appendChild: () => {} };
    map.statusDisplay = { innerHTML: "", classList: { remove: () => {}, add: () => {} } };
    
    // Set explicit seed for determinism in this test
    rng.setSeed(12345);
    
    // Generate map
    map.generate("bushwhack");
    
    // Modify state: Move functionality is hard to invoke without DOM, 
    // but we can manually hack the mapData
    const unitX = 2;
    const unitY = 2;
    // Ensure there's a unit or place one
    map.mapData[unitY][unitX] = { 
        type: "unit", char: "T", css: "test-unit", desc: "Test Unit",
        // Add specific property to track
        hp: 100 
    };

    const initialSeed = rng.getSeed();
    const initialRound = map.round;
    
    // 2. Serialize
    const startData = map.serialize();
    
    assertExists(startData);
    assertEquals(startData.width, 10);
    assertEquals(startData.rngSeed, initialSeed);
    assertEquals(startData.mapData[unitY][unitX].char, "T");

    // 3. Create New Map and Deserialize
    const newMap = new TacticalMap(10, 10);
    newMap.container = { style: {}, innerHTML: "", appendChild: () => {} };
    newMap.statusDisplay = { innerHTML: "", classList: { remove: () => {}, add: () => {} } };

    const success = newMap.deserialize(startData);
    
    assertEquals(success, true);
    
    // 4. Verification
    assertEquals(newMap.width, 10);
    assertEquals(newMap.round, initialRound);
    assertEquals(rng.getSeed(), startData.rngSeed); // RNG should be restored
    
    // Check Map integrity
    const restoredUnit = newMap.mapData[unitY][unitX];
    assertEquals(restoredUnit.char, "T");
    assertEquals(restoredUnit.desc, "Test Unit");
    
    // Check computed visibility logic didn't crash (implicit)
});

Deno.test("State System - RNG Persistence", () => {
    rng.setSeed(5555);
    const val1 = rng.random();
    const state = rng.getSeed();
    
    const val2 = rng.random();
    const val3 = rng.random();
    
    // Restore
    rng.setSeed(state);
    const val2_restored = rng.random();
    const val3_restored = rng.random();
    
    assertEquals(val2, val2_restored);
    assertEquals(val3, val3_restored);
});
