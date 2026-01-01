import "./test_setup.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";

Deno.test("Toll Bridge - Map Generation", async () => {
    const { TacticalMap } = await import("../app.js");
    const map = new TacticalMap(50, 25);
    map.generate("tollBridge");

    const center = { x: 25, y: 12 };

    map.generate("tollBridge");

    // Find a river cell that is NOT bridge
    // River x: 22-28
    // Bridge y: 11-13
    // Use x=25, y=5
    const riverX = 25;
    const riverY = 5;

    // Place unit adjacent (x=21, y=5)
    map.placeEntity(21, 5, 'V', 'victim', 'Victim');

    // Move into river
    map.moveUnit(21, 5, riverX, riverY);

    // Unit should be gone (replaced by river cell)
    const targetCell = map.mapData[riverY][riverX];
    assertEquals(targetCell.isRiver, true);
    assertEquals(targetCell.type, 'hazard');
    assertEquals(targetCell.char, '≈'); // Should not be 'V'
});
