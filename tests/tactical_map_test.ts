import "./test_setup.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("TacticalMap Initialization", async () => {
    const { TacticalMap } = await import("../app.js");
    const map = new TacticalMap(50, 25);
    assertEquals(map.width, 50);

    // Try to place a unit manually
    map.placeEntity(5, 5, 'T', 'test-css', 'Test Unit');
    const cell = map.mapData[5][5];

    assertEquals(cell.type, 'unit');
    assertEquals(cell.char, 'T');
    assertEquals(cell.desc, 'Test Unit');
});

Deno.test("TacticalMap Valid Spawn", async () => {
    const { TacticalMap } = await import("../app.js");
    const map = new TacticalMap(10, 10);
    map.generate("bushwhack");

    // 0,0 is usually a wall or edge
    // Let's find a floor tile
    let floorX = -1, floorY = -1;
    for (let y = 1; y < 9; y++) {
        for (let x = 1; x < 9; x++) {
            if (map.mapData[y][x].type === 'floor') {
                floorX = x;
                floorY = y;
                break;
            }
        }
        if (floorX !== -1) break;
    }

    if (floorX !== -1) {
        assertEquals(map.isValidSpawn(floorX, floorY), true);
    }

    // Test out of bounds
    assertEquals(map.isValidSpawn(-1, 0), false);
    assertEquals(map.isValidSpawn(0, -1), false);
    assertEquals(map.isValidSpawn(100, 100), false);
});
