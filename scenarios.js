/**
 * Necromunda Scenario Definitions
 * Each scenario has unique setup, objectives, and victory conditions
 */
import { rng } from "./src/rng.js";

// Export for use in main app
export const SCENARIOS = {
  bushwhack: {
    name: "Bushwhack",
    description: "Target Enemy Leaders/Champions",
    source: "Zone Mortalis Ambush",
    attacker: {
      deployment: "short_edge",
      count: 6,
      objective: "Take out enemy leaders",
    },
    defender: {
      deployment: "opposite_edge",
      count: "D3+2",
      reinforcements: true,
    },
    setup: (map) => {
      map.log(
        "OBJECTIVE: BUSHWHACK<br>Eliminate enemy leaders and high-value targets.",
      );
    },
    checkVictory: (_map) => {
      // Check if leaders are down
      return "Victory conditions: Eliminate all defenders or bottle out";
    },
  },

  scrag: {
    name: "Scrag",
    description: "Target nominated fighter (Priority Target)",
    source: "Zone Mortalis Ambush",
    attacker: {
      deployment: "short_edge",
      count: 6,
      objective: "Eliminate priority target",
    },
    defender: {
      deployment: "opposite_edge",
      count: "D3+2",
      reinforcements: true,
    },
    setup: (map) => {
      // Mark one defender as priority target
      map.log(
        "OBJECTIVE: SCRAG<br>Eliminate the priority target marked with [!]",
      );
      const defenders = map.getUnitsByType("G");
      if (defenders.length > 0) {
        const target = rng.pick(defenders);
        target.priority = true;
        target.desc = "Priority Target [!]";
      }
    },
    checkVictory: (map) => {
      const target = map.getUnitsByType("G").find((u) => u.priority);
      return target
        ? "Priority target still active"
        : "VICTORY: Target eliminated!";
    },
  },

  mayhem: {
    name: "Mayhem",
    description: "Serious Injuries & Escape via short edge",
    source: "Zone Mortalis Ambush",
    attacker: {
      deployment: "short_edge",
      count: 6,
      objective: "Cause casualties and extract",
    },
    defender: {
      deployment: "opposite_edge",
      count: "D3+2",
      reinforcements: true,
    },
    setup: (map) => {
      map.log(
        "OBJECTIVE: MAYHEM<br>Inflict maximum casualties and escape via deployment edge.",
      );
    },
    checkVictory: (_map) => {
      return "Victory: Most casualties inflicted and successful extraction";
    },
  },

  manufactorumRaid: {
    name: "Manufactorum Raid",
    description: "Plant bombs on vital machinery",
    source: "The Book of Peril, p80",
    attacker: {
      deployment: "short_edge",
      count: "custom",
      objective: "Plant and detonate 3 bombs",
    },
    defender: {
      deployment: "opposite_edge",
      count: "D3+5",
      reinforcements: true,
      reinforcementRate: "D3_per_round",
    },
    bombs: {
      count: 3,
      minDistanceFromAttacker: 16,
      minDistanceBetweenBombs: 12,
      explosionStrength: 6,
      explosionDamage: "D3",
      detonationThreshold: 7,
    },
    setup: (map) => {
      map.log(
        "SCENARIO: MANUFACTORUM RAID<br>Plant explosives on critical machinery!",
      );
      map.bombs = [];

      // Place 3 bomb markers
      let placedBombs = 0;
      let attempts = 0;
      const maxAttempts = 100;

      while (placedBombs < 3 && attempts < maxAttempts) {
        attempts++;
        const x = map.rand(5, map.width - 5);
        const y = map.rand(5, Math.floor(map.height / 2));

        // Check distance from attacker spawn (bottom of map)
        const distFromAttacker = Math.abs(y - (map.height - 4));

        // Check distance from other bombs
        let validPlacement = distFromAttacker >= 8;
        for (let bomb of map.bombs) {
          const dist = Math.sqrt(
            Math.pow(x - bomb.x, 2) + Math.pow(y - bomb.y, 2),
          );
          if (dist < 12) {
            validPlacement = false;
            break;
          }
        }

        if (validPlacement && map.isValidSpawn(x, y)) {
          map.bombs.push({
            x: x,
            y: y,
            planted: false,
            armed: false,
            counter: 0,
            exploded: false,
          });

          // Place marker on map
          map.mapData[y][x] = {
            type: "objective",
            char: "⊗",
            css: "obj-marker",
            desc: "Bomb Site [Not Planted]",
            bombIndex: placedBombs,
          };

          placedBombs++;
        }
      }

      map.log(`${placedBombs} bomb sites identified and marked.`);
    },
    rules: {
      industrialTerrain: "functioning", // Activates on 3+ instead of 6
      reinforcementStart: 2, // Round 2 onwards
    },
    actions: {
      plantBomb: {
        name: "Plant Bomb",
        type: "double",
        requirements: "Base contact with bomb marker",
        effect: (map, unit, bombIndex) => {
          const bomb = map.bombs[bombIndex];
          if (!bomb.planted) {
            bomb.planted = true;
            bomb.armed = true;
            bomb.counter = 1;
            map.log(
              `Bomb planted at site ${bombIndex + 1}! Timer: ${bomb.counter}`,
            );

            // Update marker
            const marker = map.mapData[bomb.y][bomb.x];
            marker.char = "◉";
            marker.desc = `Bomb [ARMED] Counter: ${bomb.counter}`;

            return true;
          }
          return false;
        },
      },
      disarmBomb: {
        name: "Disarm Bomb",
        type: "double",
        requirements: "Base contact with planted bomb + Intelligence check",
        effect: (map, _unit, bombIndex) => {
          const bomb = map.bombs[bombIndex];
          if (bomb.planted && bomb.armed) {
            // Intelligence check (simplified as 4+ roll)
            const roll = map.rand(1, 6);
            const doubleCheck = map.rand(1, 6);

            if (roll >= 4) {
              bomb.armed = false;
              map.log(`Bomb ${bombIndex + 1} DISARMED by defender!`);

              const marker = map.mapData[bomb.y][bomb.x];
              marker.char = "⊘";
              marker.desc = `Bomb [DISARMED]`;
              return true;
            } else {
              map.log(`Disarm attempt failed (rolled ${roll})`);
              // Check for critical failure (double)
              if (roll === doubleCheck) {
                map.log("CRITICAL FAILURE! Bomb detonates!");
                map.detonateBomb(bombIndex);
              }
            }
          }
          return false;
        },
      },
      rearmBomb: {
        name: "Rearm Bomb",
        type: "double",
        requirements: "Base contact with disarmed bomb",
        effect: (map, _unit, bombIndex) => {
          const bomb = map.bombs[bombIndex];
          if (bomb.planted && !bomb.armed) {
            bomb.armed = true;
            bomb.counter = 1;
            map.log(`Bomb ${bombIndex + 1} REARMED!`);

            const marker = map.mapData[bomb.y][bomb.x];
            marker.char = "◉";
            marker.desc = `Bomb [ARMED] Counter: ${bomb.counter}`;
            return true;
          }
          return false;
        },
      },
    },
    endPhase: (map) => {
      // Roll for each armed bomb
      map.bombs.forEach((bomb, index) => {
        if (bomb.armed && !bomb.exploded) {
          const roll = map.rand(1, 6);
          const total = roll + bomb.counter;

          map.log(
            `Bomb ${
              index + 1
            }: Rolled ${roll} + ${bomb.counter} counter = ${total}`,
          );

          if (total >= 7) {
            map.detonateBomb(index);
          } else {
            bomb.counter++;
            const marker = map.mapData[bomb.y][bomb.x];
            marker.desc = `Bomb [ARMED] Counter: ${bomb.counter}`;
            map.log(`Bomb ${index + 1} counter increased to ${bomb.counter}`);
          }
        }
      });
    },
    checkVictory: (map) => {
      const explodedCount = map.bombs.filter((b) => b.exploded).length;
      const totalBombs = map.bombs.length;

      if (explodedCount === totalBombs) {
        return {
          ended: true,
          winner: "attacker",
          message:
            `ALL BOMBS DETONATED! Attacker Victory!<br>Reputation: +D3<br>Experience distributed.`,
        };
      }

      // Check if all attackers or defenders eliminated
      const attackers = map.getUnitsByType("M");
      const defenders = map.getUnitsByType("G");

      if (attackers.length === 0) {
        return {
          ended: true,
          winner: "defender",
          message: `Attackers eliminated! Defender Victory!<br>Credits: +${
            map.rand(2, 12) * 10
          }<br>Reputation: +D${explodedCount === 0 ? 6 : 3}`,
        };
      }

      if (defenders.length === 0 && !map.defenderReinforcements) {
        return {
          ended: true,
          winner: "attacker",
          message: "Defenders eliminated! Attacker Victory!",
        };
      }

      return { ended: false };
    },
    rewards: {
      attacker: {
        victory: "D3 Reputation if all bombs explode",
        experience: "1 XP per fighter + 1 XP per bomb planted/rearmed",
      },
      defender: {
        victory:
          "2D6x10 credits, D6 Reputation (none exploded) or D3 Reputation (1-2 exploded)",
        experience: "1 XP per fighter + D3 XP per bomb disarmed",
      },
    },
  },

  conveyer: {
    name: "The Conveyer",
    description: "Descend through the hive on a moving platform",
    source: "The Book of Peril, p82",
    attacker: {
      deployment: "16_from_platform",
      count: 10,
      objective: "Eliminate defenders or survive 9 rounds",
    },
    defender: {
      deployment: "on_platform",
      count: 10,
      objective: "Hold platform for 9 rounds",
    },
    platform: {
      radius: 6, // Approximately 12" diameter in cells
      moveThreshold: 6,
      lootCasketCount: 4,
      lootCasketDistance: 12,
    },
    rules: {
      maxRounds: 9,
      platformMovementBonus: 1, // Cumulative +1 per turn stationary
    },
    setup: (map) => {
      map.log("SCENARIO: THE CONVEYER<br>Descending through the underhive!");

      // Platform state tracking
      map.platform = {
        centerX: Math.floor(map.width / 2),
        centerY: Math.floor(map.height / 2),
        radius: 6,
        stationaryTurns: 0,
        hasMoved: false,
      };

      map.lootCaskets = [];
      map.maxRounds = 9;

      // Mark platform area
      const cx = map.platform.centerX;
      const cy = map.platform.centerY;
      const r = map.platform.radius;

      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
            const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
            if (dist <= r) {
              // Only mark floor tiles as platform
              if (
                map.mapData[y][x].type === "floor" ||
                map.mapData[y][x].type === "rubble"
              ) {
                map.mapData[y][x].onPlatform = true;
                map.mapData[y][x].desc += " [PLATFORM]";
              }
            }
          }
        }
      }

      // Place 4 loot caskets within 12 cells of platform edge
      let placedCaskets = 0;
      let attempts = 0;
      while (placedCaskets < 4 && attempts < 100) {
        attempts++;

        // Random angle and distance from platform
        const angle = rng.random() * Math.PI * 2;
        const distance = r + 3 + rng.random() * 9; // 3-12 cells from edge

        const x = Math.round(cx + Math.cos(angle) * distance);
        const y = Math.round(cy + Math.sin(angle) * distance);

        if (x >= 1 && x < map.width - 1 && y >= 1 && y < map.height - 1) {
          const cell = map.mapData[y][x];
          if (cell.type === "floor" || cell.type === "rubble") {
            map.lootCaskets.push({
              x: x,
              y: y,
              onPlatform: false,
              recovered: false,
            });

            map.mapData[y][x] = {
              type: "loot",
              char: "◆",
              css: "obj-marker",
              desc: "Loot Casket",
              casketIndex: placedCaskets,
            };

            placedCaskets++;
          }
        }
      }

      map.log(
        `Platform established. ${placedCaskets} loot caskets placed.<br>Platform will descend on 6+ (cumulative +1 per turn).`,
      );
    },
    endPhase: (map) => {
      // Check if platform moves
      map.platform.stationaryTurns++;

      const roll = map.rand(1, 6);
      const bonus = map.platform.stationaryTurns - 1; // -1 because we increment before rolling
      const total = roll + bonus;

      map.log(`Platform stability: Rolled ${roll} + ${bonus} bonus = ${total}`);

      if (total >= 6) {
        // Platform moves!
        map.log(
          '<span style="color: #ffff00; font-weight: bold;">*** PLATFORM DESCENDING! ***</span>',
        );

        // Track which loot caskets are on platform
        map.lootCaskets.forEach((casket, index) => {
          const cell = map.mapData[casket.y][casket.x];
          if (cell.onPlatform) {
            casket.onPlatform = true;
            map.log(`Loot casket ${index + 1} secured on platform!`);
          }
        });

        // Remove fighters not on platform (moved off board temporarily)
        let removedAttackers = 0;
        for (let y = 0; y < map.height; y++) {
          for (let x = 0; x < map.width; x++) {
            const cell = map.mapData[y][x];
            if (cell.type === "unit" && cell.char === "M" && !cell.onPlatform) {
              removedAttackers++;
            }
          }
        }

        if (removedAttackers > 0) {
          map.log(
            `${removedAttackers} attackers left behind as platform descends...`,
          );
        }

        // Regenerate terrain around platform
        map.regenerateLevel();
        map.platform.stationaryTurns = 0;
        map.platform.hasMoved = true;

        // Redeploy attackers not on platform
        map.redeployAttackers();
      } else {
        map.log(`Platform holds steady (need ${6 - bonus}+ next turn).`);
      }

      // Check loot casket status
      const onPlatform = map.lootCaskets.filter((c) => c.onPlatform).length;
      if (onPlatform > 0) {
        map.log(`Loot status: ${onPlatform}/4 caskets on platform.`);
      }
    },
    checkVictory: (map) => {
      // Check if max rounds reached
      if (map.round >= 9) {
        const onPlatform = map.lootCaskets.filter((c) => c.onPlatform).length;
        return {
          ended: true,
          winner: "defender",
          message:
            `9 rounds complete! Defender Victory!<br>Loot recovered: ${onPlatform}/4 caskets<br>Credits: +${
              onPlatform * map.rand(1, 6) * 10
            }<br>Reputation: +D3`,
        };
      }

      // Check if no defenders on board
      const defenders = map.getUnitsByType("G");
      if (defenders.length === 0) {
        return {
          ended: true,
          winner: "attacker",
          message:
            `All defenders eliminated! Attacker Victory!<br>Reputation: +D3`,
        };
      }

      return { ended: false };
    },
    rewards: {
      attacker: {
        victory: "D3 Reputation if game ends before round 9",
        experience:
          "1 XP per fighter + 1 XP for being on platform when it moves",
      },
      defender: {
        victory: "D6x10 credits per loot casket on platform + D3 Reputation",
        experience: "1 XP per fighter + 1 XP for being on platform at end",
      },
    },
  },

  fungalHorror: {
    name: "Fungal Horror",
    description: "Survive a rapidly growing fungal jungle",
    source: "The Book of Peril, p84",
    attacker: {
      deployment: "standard",
      count: 10,
      objective: "Survive the spreading horror",
    },
    defender: {
      deployment: "standard",
      count: 10,
      objective: "Survive the spreading horror",
    },
    fungalGrowth: {
      initialRadius: 6, // 12" = ~6 cells radius
      spreadChance: 4, // 4+ on D6
      maxMarkers: 9,
      lineOfSightLimit: 3, // 6" = ~3 cells
    },
    rules: {
      overgrowthHazard: "blaze", // Treat as catching fire
      seriouslyInjuredOutOfAction: true,
      movementRestriction: "one_move_only", // Unless respirator
    },
    setup: (map) => {
      map.log(
        "SCENARIO: FUNGAL HORROR<br>A writhing nightmare spreads across the battlefield!",
      );

      // Initialize fungal markers
      map.fungalMarkers = [];
      map.maxFungalMarkers = 9;

      // Place initial marker in center
      const centerMarker = {
        x: Math.floor(map.width / 2),
        y: Math.floor(map.height / 2),
        radius: 6,
      };

      map.fungalMarkers.push(centerMarker);

      // Mark overgrown area
      map.markOvergrownArea(centerMarker);

      map.log(
        `Central fungal horror established at [${centerMarker.x},${centerMarker.y}].<br>Overgrown areas cause Blaze-like damage!<br>Line of sight limited to 6" in overgrowth.<br>Game ends at ${map.maxFungalMarkers} markers or no fighters remain.`,
      );
    },
    endPhase: (map) => {
      // Roll for each existing fungal marker to spread
      const newMarkers = [];

      map.fungalMarkers.forEach((marker, index) => {
        const roll = map.rand(1, 6);
        map.log(`Fungal marker ${index + 1}: Growth roll ${roll} (need 4+)`);

        if (roll >= 4) {
          // Roll scatter direction
          const direction = map.rand(1, 8); // 8 directions
          const angleMap = {
            1: 0, // East
            2: 45, // NE
            3: 90, // North
            4: 135, // NW
            5: 180, // West
            6: 225, // SW
            7: 270, // South
            8: 315, // SE
          };

          const angle = angleMap[direction] * Math.PI / 180;
          const distance = 12; // 12 cells away

          const newX = Math.round(marker.x + Math.cos(angle) * distance);
          const newY = Math.round(marker.y + Math.sin(angle) * distance);

          // Clamp to board edges
          const clampedX = Math.max(0, Math.min(map.width - 1, newX));
          const clampedY = Math.max(0, Math.min(map.height - 1, newY));

          const newMarker = {
            x: clampedX,
            y: clampedY,
            radius: 6,
          };

          newMarkers.push(newMarker);
          map.log(
            `<span style="color: #adff2f; font-weight: bold;">Fungus SPREADS to [${clampedX},${clampedY}]!</span>`,
          );
        }
      });

      // Add new markers
      newMarkers.forEach((marker) => {
        map.fungalMarkers.push(marker);
        map.markOvergrownArea(marker);
      });

      // Check if max markers reached
      if (map.fungalMarkers.length >= map.maxFungalMarkers) {
        map.log(
          `<span style="color: #ff0000; font-weight: bold;">CRITICAL: ${map.fungalMarkers.length} fungal markers! Board is overrun!</span>`,
        );
      }

      // Apply hazard damage to fighters in overgrown areas
      map.applyFungalHazard();
    },
    checkVictory: (map) => {
      // Game ends if 9+ markers
      if (map.fungalMarkers.length >= 9) {
        const attackers = map.getUnitsByType("M");
        const defenders = map.getUnitsByType("G");

        if (attackers.length > 0 && defenders.length === 0) {
          return {
            ended: true,
            winner: "attacker",
            message:
              "Fungal horror overruns battlefield! Attackers survive!<br>Reputation: +D3",
          };
        } else if (defenders.length > 0 && attackers.length === 0) {
          return {
            ended: true,
            winner: "defender",
            message:
              "Fungal horror overruns battlefield! Defenders survive!<br>Reputation: +D3",
          };
        } else if (attackers.length > 0 || defenders.length > 0) {
          return {
            ended: true,
            winner: attackers.length >= defenders.length
              ? "attacker"
              : "defender",
            message: `Fungal horror overruns battlefield! ${
              attackers.length >= defenders.length ? "Attackers" : "Defenders"
            } survive with more fighters!<br>Reputation: +D3`,
          };
        } else {
          return {
            ended: true,
            winner: "draw",
            message: "All fighters consumed by fungal horror! DRAW!",
          };
        }
      }

      // Check if either side eliminated
      const attackers = map.getUnitsByType("M");
      const defenders = map.getUnitsByType("G");

      if (attackers.length === 0 && defenders.length === 0) {
        return {
          ended: true,
          winner: "draw",
          message: "Both gangs eliminated! DRAW!",
        };
      } else if (attackers.length === 0) {
        return {
          ended: true,
          winner: "defender",
          message: "Attackers eliminated! Defender Victory!<br>Reputation: +D3",
        };
      } else if (defenders.length === 0) {
        return {
          ended: true,
          winner: "attacker",
          message: "Defenders eliminated! Attacker Victory!<br>Reputation: +D3",
        };
      }

      return { ended: false };
    },
    rewards: {
      attacker: {
        victory: "D3 Reputation if survived",
        experience: "1 XP per fighter",
      },
      defender: {
        victory: "D3 Reputation if survived",
        experience: "1 XP per fighter",
      },
    },
  },

  tollBridge: {
    name: "Toll Bridge",
    description: "Control the bridge over the toxic river",
    source: "The Book of Peril, p86",
    attacker: {
      deployment: "standard",
      count: 10,
      objective: "Control the bridge",
    },
    defender: {
      deployment: "standard",
      count: 10,
      objective: "Control the bridge",
    },
    rules: {
      toxicRiver: true,
      bridgePivot: true,
      maxRounds: 10, // Arbitrary limit for game end check if not specified
    },
    setup: (map) => {
      map.log(
        "SCENARIO: TOLL BRIDGE<br>Control the bridge spanning the toxic river!",
      );
      map.generateTollBridge();
    },
    endPhase: (map) => {
      // Bridge Pivot Logic (Round 3+)
      if (map.round >= 3) {
        const roll = map.rand(1, 6);
        map.log(`Bridge Mechanism: Rolled ${roll}`);

        if (roll === 5) {
          map.pivotBridge("right");
        } else if (roll === 6) {
          map.pivotBridge("left");
        } else {
          map.log("The bridge remains stationary.");
        }
      }
    },
    checkVictory: (map) => {
      // Check if one gang has fighters within 12" (approx 6 cells) of center
      // and opponent does not.
      const center = {
        x: Math.floor(map.width / 2),
        y: Math.floor(map.height / 2),
      };
      const radius = 6;

      const attackers = map.getUnitsByType("M");
      const defenders = map.getUnitsByType("G");

      const attackersOnBridge = attackers.filter((u) => {
        const dist = Math.sqrt(
          Math.pow(u.x - center.x, 2) + Math.pow(u.y - center.y, 2),
        );
        return dist <= radius;
      });

      const defendersOnBridge = defenders.filter((u) => {
        const dist = Math.sqrt(
          Math.pow(u.x - center.x, 2) + Math.pow(u.y - center.y, 2),
        );
        return dist <= radius;
      });

      // Game ends if no fighters on board (simplified check)
      if (attackers.length === 0 && defenders.length === 0) {
        return {
          ended: true,
          winner: "draw",
          message: "All fighters eliminated! DRAW!",
        };
      }

      // Check victory condition after round 3 (or just check every round as per rules "Ending the Battle")
      // Rules: "If either player has no fighters on the board at the end of a round... or if after round 3..."

      if (map.round >= 3) {
        if (attackersOnBridge.length > 0 && defendersOnBridge.length === 0) {
          return {
            ended: true,
            winner: "attacker",
            message: "Attackers control the bridge! VICTORY!",
          };
        } else if (
          defendersOnBridge.length > 0 && attackersOnBridge.length === 0
        ) {
          return {
            ended: true,
            winner: "defender",
            message: "Defenders control the bridge! VICTORY!",
          };
        }
      }

      if (attackers.length === 0) {
        return {
          ended: true,
          winner: "defender",
          message: "Attackers eliminated! Defender Victory!",
        };
      }

      if (defenders.length === 0) {
        return {
          ended: true,
          winner: "attacker",
          message: "Defenders eliminated! Attacker Victory!",
        };
      }

      return { ended: false };
    },
  },
};
