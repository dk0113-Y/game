import type { Terrain, TerrainRule } from "../core/types";

export const terrainRules: Record<Terrain, TerrainRule> = {
  plain: {
    label: "平原",
    potential: {
      food: 2,
      wood: 0,
      stone: 0,
      knowledge: 0,
    },
    moveCost: 1,
    canFoundSettlement: true,
  },
  hill: {
    label: "丘陵",
    potential: {
      food: 0,
      wood: 1,
      stone: 2,
      knowledge: 0,
    },
    moveCost: 2,
    canFoundSettlement: true,
  },
  plateau: {
    label: "高原",
    potential: {
      food: 1,
      wood: 0,
      stone: 1,
      knowledge: 0,
    },
    moveCost: 2,
    canFoundSettlement: true,
  },
  mountain: {
    label: "山地",
    potential: {
      food: 0,
      wood: 1,
      stone: 3,
      knowledge: 0,
    },
    moveCost: 4,
    canFoundSettlement: false,
  },
  peak: {
    label: "山峰",
    potential: {
      food: 0,
      wood: 0,
      stone: 4,
      knowledge: 1,
    },
    moveCost: 99,
    canFoundSettlement: false,
    blocked: true,
  },
  lake: {
    label: "湖泊",
    potential: {
      food: 2,
      wood: 0,
      stone: 0,
      knowledge: 1,
    },
    moveCost: 3,
    canFoundSettlement: false,
  },
};
