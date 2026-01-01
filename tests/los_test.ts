
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { LOS } from "../src/los.js";

Deno.test("LOS - Bresenham Line Generation", () => {
    const los = new LOS(10, 10);
    
    // Horizontal line
    let line = los.getLine(0, 0, 3, 0);
    assertEquals(line.length, 4);
    assertEquals(line[0], { x: 0, y: 0 });
    assertEquals(line[3], { x: 3, y: 0 });

    // Diagonal line
    line = los.getLine(0, 0, 2, 2);
    assertEquals(line.length, 3);
    assertEquals(line[0], { x: 0, y: 0 });
    assertEquals(line[1], { x: 1, y: 1 });
    assertEquals(line[2], { x: 2, y: 2 });
});

Deno.test("LOS - Wall Blocking", () => {
    const width = 5;
    const height = 5;
    const los = new LOS(width, height);

    // Create a mock map
    // 0 0 0 0 0
    // 0 0 W 0 0 (W = Wall at 2,1)
    // 0 0 0 0 0
    const mapData = Array(height).fill(null).map(() => 
        Array(width).fill(null).map(() => ({ type: 'floor' }))
    );
    mapData[1][2] = { type: 'wall' };

    // Test visibility from (0,1) looking across the wall to (4,1)
    // Origin: 0,1
    // Target: 4,1 (blocked by 2,1)
    
    const visibleSet = los.calculateVisibility(mapData, 0, 1, 5);

    // Expect wall to be visible
    assertEquals(visibleSet.has("2,1"), true, "Wall should be visible");
    // Expect space behind wall to be hidden
    assertEquals(visibleSet.has("3,1"), false, "Space behind wall should be hidden");
    assertEquals(visibleSet.has("4,1"), false, "Far space behind wall should be hidden");
});

Deno.test("LOS - Open Ground", () => {
    const width = 5;
    const height = 5;
    const los = new LOS(width, height);
    const mapData = Array(height).fill(null).map(() => 
        Array(width).fill(null).map(() => ({ type: 'floor' }))
    );

    const visibleSet = los.calculateVisibility(mapData, 2, 2, 2);
    
    // Should see adjacent cells
    assertEquals(visibleSet.has("2,1"), true);
    assertEquals(visibleSet.has("3,2"), true);
});
