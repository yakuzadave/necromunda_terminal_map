/**
 * Type definitions for Necromunda Tactical Auspex
 */

export type CellType =
  | "floor"
  | "wall"
  | "unit"
  | "rubble"
  | "hazard"
  | "objective";

export interface MapCell {
  type: CellType;
  char: string;
  css: string;
  desc: string;
  bombIndex?: number;
  priority?: boolean;
}

export interface Bomb {
  x: number;
  y: number;
  planted: boolean;
  armed: boolean;
  counter: number;
  exploded: boolean;
}

export interface Unit {
  x: number;
  y: number;
  char: string;
  css: string;
  desc: string;
  type: CellType;
  priority?: boolean;
}

export interface SelectedUnit {
  x: number;
  y: number;
  data: MapCell;
}

export interface VictoryResult {
  ended: boolean;
  winner?: string;
  message?: string;
}

export interface DeploymentConfig {
  deployment: string;
  count: number | string;
  objective: string;
  reinforcements?: boolean;
  reinforcementRate?: string;
}

export interface ScenarioAction {
  name: string;
  type: string;
  requirements: string;
  effect: (map: any, unit: MapCell, index: number) => boolean;
}

export interface ScenarioRules {
  industrialTerrain?: string;
  reinforcementStart?: number;
}

export interface ScenarioRewards {
  attacker?: {
    victory?: string;
    experience?: string;
  };
  defender?: {
    victory?: string;
    experience?: string;
  };
}

export interface Scenario {
  name: string;
  description: string;
  source: string;
  attacker: DeploymentConfig;
  defender: DeploymentConfig;
  bombs?: {
    count: number;
    minDistanceFromAttacker: number;
    minDistanceBetweenBombs: number;
    explosionStrength: number;
    explosionDamage: string;
    detonationThreshold: number;
  };
  setup?: (map: any) => void;
  endPhase?: (map: any) => void;
  checkVictory?: (map: any) => VictoryResult;
  actions?: Record<string, ScenarioAction>;
  rules?: ScenarioRules;
  rewards?: ScenarioRewards;
}

export type ScenarioKey = "bushwhack" | "scrag" | "mayhem" | "manufactorumRaid";

export interface Scenarios {
  [key: string]: Scenario;
}
