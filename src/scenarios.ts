/**
 * Necromunda Scenario Definitions
 * TypeScript version for Deno
 */

import type { Scenarios } from "./types.ts";

export const SCENARIOS: Scenarios = {
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
    setup: (map: any) => {
      map.log(
        "OBJECTIVE: BUSHWHACK<br>Eliminate enemy leaders and high-value targets.",
      );
    },
    checkVictory: (map: any) => {
      return { ended: false };
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
    setup: (map: any) => {
      map.log(
        "OBJECTIVE: SCRAG<br>Eliminate the priority target marked with [!]",
      );
      const defenders = map.getUnitsByType("G");
      if (defenders.length > 0) {
        const target = defenders[Math.floor(Math.random() * defenders.length)];
        target.priority = true;
        target.desc = "Priority Target [!]";
      }
    },
    checkVictory: (map: any) => {
      const target = map.getUnitsByType("G").find((u: any) => u.priority);
      return { ended: false };
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
    setup: (map: any) => {
      map.log(
        "OBJECTIVE: MAYHEM<br>Inflict maximum casualties and escape via deployment edge.",
      );
    },
    checkVictory: (map: any) => {
      return { ended: false };
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
    setup: (map: any) => {
      map.log(
        "SCENARIO: MANUFACTORUM RAID<br>Plant explosives on critical machinery!",
      );
      map.bombs = [];

      let placedBombs = 0;
      let attempts = 0;
      const maxAttempts = 100;

      while (placedBombs < 3 && attempts < maxAttempts) {
        attempts++;
        const x = map.rand(5, map.width - 5);
        const y = map.rand(5, Math.floor(map.height / 2));

        const distFromAttacker = Math.abs(y - (map.height - 4));

        let validPlacement = distFromAttacker >= 8;
        for (const bomb of map.bombs) {
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
      industrialTerrain: "functioning",
      reinforcementStart: 2,
    },
    actions: {
      plantBomb: {
        name: "Plant Bomb",
        type: "double",
        requirements: "Base contact with bomb marker",
        effect: (map: any, unit: any, bombIndex: number) => {
          const bomb = map.bombs[bombIndex];
          if (!bomb.planted) {
            bomb.planted = true;
            bomb.armed = true;
            bomb.counter = 1;
            map.log(
              `Bomb planted at site ${bombIndex + 1}! Timer: ${bomb.counter}`,
            );

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
        effect: (map: any, unit: any, bombIndex: number) => {
          const bomb = map.bombs[bombIndex];
          if (bomb.planted && bomb.armed) {
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
        effect: (map: any, unit: any, bombIndex: number) => {
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
    endPhase: (map: any) => {
      map.bombs.forEach((bomb: any, index: number) => {
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
    checkVictory: (map: any) => {
      const explodedCount = map.bombs.filter((b: any) => b.exploded).length;
      const totalBombs = map.bombs.length;

      if (explodedCount === totalBombs) {
        return {
          ended: true,
          winner: "attacker",
          message:
            `ALL BOMBS DETONATED! Attacker Victory!<br>Reputation: +D3<br>Experience distributed.`,
        };
      }

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
};
