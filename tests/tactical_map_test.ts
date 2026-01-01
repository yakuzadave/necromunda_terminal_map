
import "./test_setup.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("TacticalMap Initialization", async () => {
    const { TacticalMap } = await import("../app.js");
    const map = new TacticalMap(50, 25);
    map.generate(); // Initialize mapData
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

Deno.test("TacticalMap Move Logic", async () => {
    const { TacticalMap } = await import("../app.js");
    const map = new TacticalMap(10, 10);
    map.generate("bushwhack");

    // Find a floor tile
    let fx = -1, fy = -1;
    for (let y = 1; y < 9; y++) {
        for (let x = 1; x < 9; x++) {
            if (map.mapData[y][x].type === 'floor') {
                fx = x; fy = y; break;
            }
        }
        if (fx !== -1) break;
    }

    // Place unit
    map.placeEntity(fx, fy, 'T', 'test', 'Test Unit');

    // Find adjacent floor
    let tx = -1, ty = -1;
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dx, dy] of dirs) {
        const nx = fx + dx, ny = fy + dy;
        if (map.mapData[ny][nx].type === 'floor') {
            tx = nx; ty = ny; break;
        }
    }

    if (tx !== -1) {
        map.moveUnit(fx, fy, tx, ty);
        assertEquals(map.mapData[ty][tx].char, 'T');
        assertEquals(map.mapData[fy][fx].type, 'floor');
    }
});

Deno.test("TacticalMap Placement Overwrite", async () => {
    const { TacticalMap } = await import("../app.js");
    const map = new TacticalMap(10, 10);
    map.generate("bushwhack");

    const x = 5, y = 5;
    map.placeEntity(x, y, 'A', 'style-a', 'Unit A');
    assertEquals(map.mapData[y][x].char, 'A');

    // Overwrite
    map.placeEntity(x, y, 'B', 'style-b', 'Unit B');
    assertEquals(map.mapData[y][x].char, 'B');
    assertEquals(map.mapData[y][x].desc, 'Unit B');
});
