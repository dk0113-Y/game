import type { Terrain, TerrainRule } from "../core/types";

export const terrainRules: Record<Terrain, TerrainRule> = {
  grassland: {
    label: "Grassland",
    potential: {
      food: 2,
      wood: 0,
      stone: 0,
      knowledge: 0,
    },
    moveCost: 1,
    canFoundSettlement: true,
  },
  forest: {
    label: "Forest",
    potential: {
      food: 1,
      wood: 2,
      stone: 0,
      knowledge: 0,
    },
    moveCost: 2,
    canFoundSettlement: true,
  },
  hill: {
    label: "Hill",
    potential: {
      food: 0,
      wood: 1,
      stone: 2,
      knowledge: 0,
    },
    moveCost: 2,
    canFoundSettlement: true,
  },
  river: {
    label: "River",
    potential: {
      food: 2,
      wood: 0,
      stone: 0,
      knowledge: 1,
    },
    moveCost: 1,
    canFoundSettlement: true,
  },
  coast: {
    label: "Coast",
    potential: {
      food: 1,
      wood: 0,
      stone: 0,
      knowledge: 1,
    },
    moveCost: 1,
    canFoundSettlement: true,
  },
};
