/**
 * Simple Seeded RNG using Mulberry32
 * Provides deterministic random numbers for procedural generation
 */
export class RNG {
  constructor(seed = Date.now()) {
    this.seed = seed;
  }

  /**
   * Returns a float between 0 (inclusive) and 1 (exclusive)
   */
  random() {
    let t = this.seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   */
  range(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Returns a random element from an array
   */
  pick(array) {
    if (!array || array.length === 0) return undefined;
    return array[Math.floor(this.random() * array.length)];
  }

  /**
   * Returns true with probability p (0-1)
   */
  chance(p) {
    return this.random() < p;
  }

  /**
   * Resets the seed
   */
  setSeed(seed) {
    this.seed = seed;
  }
  getSeed() {
    return this.seed;
  }
}

// Global instance for convenience
export const rng = new RNG();
