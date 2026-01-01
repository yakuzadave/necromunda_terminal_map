/**
 * Sector Mechanicus Map Generator
 * Generates dense industrial terrain with pipes, vats, and walkways.
 */
import { rng } from "./rng.js";

export class SectorMechanicusGenerator {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  generate() {
    const mapData = [];

    // 1. Fill with base floor
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        row.push({
          type: "floor",
          char: "·",
          css: "terrain-floor",
          desc: "Industrial Grating",
        });
      }
      mapData.push(row);
    }

    // 2. Dense Industrial Clusters (Cellular Automata-ish)
    // We start with high noise and smooth it differently than ZM
    // We want "blobs" of machinery (obstacles)
    const machineMap = Array(this.height).fill(0).map(() => Array(this.width).fill(0));
    
    // Seed machines
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (rng.chance(0.35)) { // Higher density
            machineMap[y][x] = 1;
        }
      }
    }

    // Smooth (Simple 1-pass CA)
    for (let i = 0; i < 2; i++) {
        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                let neighbors = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (machineMap[y+dy][x+dx] === 1) neighbors++;
                    }
                }
                if (machineMap[y][x] === 1) {
                    machineMap[y][x] = neighbors >= 4 ? 1 : 0;
                } else {
                    machineMap[y][x] = neighbors >= 5 ? 1 : 0;
                }
            }
        }
    }

    // Apply machines to map
    for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
            if (machineMap[y][x] === 1) {
                // Randomize machine type
                const r = rng.random();
                if (r < 0.3) {
                    mapData[y][x] = { type: "wall", char: "O", css: "terrain-vat", desc: "Chemical Vat (Impassable)" };
                } else if (r < 0.6) {
                    mapData[y][x] = { type: "wall", char: "#", css: "terrain-wall", desc: "Heavy Machinery" };
                } else {
                    mapData[y][x] = { type: "rubble", char: "▒", css: "terrain-rubble", desc: "Slag Heap" };
                }
            }
        }
    }

    // 3. Pipelines (Long straight lines)
    // Horizontal Pipes
    const numPipes = rng.range(2, 4);
    for (let i = 0; i < numPipes; i++) {
        const py = rng.range(2, this.height - 3);
        const startX = rng.range(0, 5);
        const len = rng.range(10, this.width - 5);
        for (let x = startX; x < startX + len && x < this.width; x++) {
             // Don't overwrite heavy machinery often, but maybe go over/through
             mapData[py][x] = { type: "floor", char: "=", css: "terrain-pipe", desc: "Pipeline (Cover)" }; 
        }
    }

    // 4. Walkways (Elevated paths)
    // Represented as distinct floor characters
    const numWalkways = rng.range(2, 3);
    for (let i = 0; i < numWalkways; i++) {
        // Vertical or Horizontal
        if (rng.chance(0.5)) {
             // Horizontal
             const cy = rng.range(5, this.height - 5);
             for (let x = 0; x < this.width; x++) {
                 // Overwrite anything except outer edge
                 if (x > 1 && x < this.width - 2) {
                    mapData[cy][x] = { type: "floor", char: "+", css: "terrain-walkway", desc: "Gantry Walkway" };
                 }
             }
        } else {
            // Vertical
            const cx = rng.range(5, this.width - 5);
            for (let y = 0; y < this.height; y++) {
                 if (y > 1 && y < this.height - 2) {
                    mapData[y][cx] = { type: "floor", char: "+", css: "terrain-walkway", desc: "Gantry Walkway" };
                 }
            }
        }
    }

    // 5. Perimeter Walls (Always present)
    for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
            if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
                 // Leave some gaps? logic from ZM...
                  // Reuse existing gap logic or simplier
                  if ((x === 0 || x === this.width - 1) && y > 10 && y < 15) {
                      mapData[y][x] = { type: "floor", char: "·", css: "terrain-floor", desc: "Access Point" };
                  } else {
                      mapData[y][x] = { type: "floor", char: "·", css: "terrain-floor", desc: "Sector Perimeter" };
                  }
            }
        }
    }

    return mapData;
  }
}
