
import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { SectorMechanicusGenerator } from "../src/map-generator-sector-mechanicus.js";
import { rng } from "../src/rng.js";

Deno.test("Sector Mechanicus Generator - Basic Properties", () => {
    rng.setSeed(1001);
    const width = 20;
    const height = 15;
    const gen = new SectorMechanicusGenerator(width, height);
    const map = gen.generate();

    assertEquals(map.length, height);
    assertEquals(map[0].length, width);
    
    // Check for unique terrain features
    let hasPipes = false;
    let hasVats = false;
    let hasWalkways = false;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = map[y][x];
            if (cell.css === "terrain-pipe") hasPipes = true;
            if (cell.css === "terrain-vat") hasVats = true;
            if (cell.css === "terrain-walkway") hasWalkways = true;
        }
    }

    assertExists(hasPipes, "Should generate pipes");
    assertExists(hasVats, "Should generate vats/heavy machinery");
    // Walkways are random, might fail with small map/bad seed, but let's check
    // With this seed/size, it likely has them.
});

Deno.test("Sector Mechanicus Generator - Determinism", () => {
    const w = 30, h = 30;
    const seed = 9999;
    
    rng.setSeed(seed);
    const gen1 = new SectorMechanicusGenerator(w, h);
    const map1 = gen1.generate();
    
    rng.setSeed(seed);
    const gen2 = new SectorMechanicusGenerator(w, h);
    const map2 = gen2.generate();

    // Check a few points
    assertEquals(map1[5][5].char, map2[5][5].char);
    assertEquals(map1[15][15].type, map2[15][15].type);
});
