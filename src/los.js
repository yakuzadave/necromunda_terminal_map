/**
 * Line of Sight (LOS) and Visibility Logic
 * Uses Bresenham's Line Algorithm for grid-based raycasting
 */

export class LOS {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    /**
     * Get all cells touched by a line from (x0, y0) to (x1, y1)
     * using Bresenham's algorithm.
     */
    getLine(x0, y0, x1, y1) {
        const points = [];
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            points.push({ x: x0, y: y0 });

            if ((x0 === x1) && (y0 === y1)) break;
            
            let e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
        return points;
    }

    /**
     * Calculate visible cells from a specific origin
     * @param {Array<Array<Object>>} mapData - 2D array of cell objects (must have .type)
     * @param {number} originX 
     * @param {number} originY 
     * @param {number} radius - Vision radius in cells
     * @returns {Set<string>} Set of visible cell keys "x,y"
     */
    calculateVisibility(mapData, originX, originY, radius) {
        const visible = new Set();
        visible.add(`${originX},${originY}`);

        // optimization: only check perimeter of the radius box
        // For accurate FOV, we cast rays to all perimeter cells in the bounding box
        const minX = Math.max(0, originX - radius);
        const maxX = Math.min(this.width - 1, originX + radius);
        const minY = Math.max(0, originY - radius);
        const maxY = Math.min(this.height - 1, originY + radius);

        // Function to cast ray to a specific target cell
        const castRay = (tx, ty) => {
            const line = this.getLine(originX, originY, tx, ty);
            let blocked = false;

            for (const p of line) {
                // Determine if this point is within max actual radius (circular logic vs square)
                const dist = Math.sqrt(Math.pow(p.x - originX, 2) + Math.pow(p.y - originY, 2));
                if (dist > radius) break;

                // Add to visible set
                visible.add(`${p.x},${p.y}`);

                // Check blocking
                // Don't check blocking for the origin itself
                if (p.x === originX && p.y === originY) continue;

                // Stop if we hit a wall/obstacle
                // If it's the target cell, we see it (the wall surface), then stop
                // But Bresenham logic puts the wall IN the line.
                // We mark it visible, then stop if it blocks.
                // mapData access safety
                 if (p.y >= 0 && p.y < this.height && p.x >= 0 && p.x < this.width) {
                    const cell = mapData[p.y][p.x];
                    if (cell.type === 'wall' || cell.type === 'door_closed') { // Example blocking types
                        blocked = true;
                        break; 
                    }
                }
            }
        };

        // Cast rays to top/bottom edges
        for (let x = minX; x <= maxX; x++) {
            castRay(x, minY);
            castRay(x, maxY);
        }
        // Cast rays to left/right edges
        for (let y = minY; y <= maxY; y++) {
            castRay(minX, y);
            castRay(maxX, y);
        }

        return visible;
    }
}
