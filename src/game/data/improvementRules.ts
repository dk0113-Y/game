import type { ImprovementRule, ImprovementType } from "../core/types";

export const improvementRules: Record<ImprovementType, ImprovementRule> = {
  farm: {
    label: "Farm",
    allowedTerrains: ["grassland", "river", "coast"],
    yield: {
      food: 1,
      wood: 0,
      stone: 0,
      knowledge: 0,
    },
  },
  lumberCamp: {
    label: "Lumber Camp",
    allowedTerrains: ["forest"],
    yield: {
      food: 0,
      wood: 1,
      stone: 0,
      knowledge: 0,
    },
  },
  quarry: {
    label: "Quarry",
    allowedTerrains: ["hill"],
    yield: {
      food: 0,
      wood: 0,
      stone: 1,
      knowledge: 0,
    },
  },
  study: {
    label: "Study",
    allowedTerrains: ["river", "coast"],
    yield: {
      food: 0,
      wood: 0,
      stone: 0,
      knowledge: 1,
    },
  },
};
