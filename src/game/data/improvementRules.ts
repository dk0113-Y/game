import type { ImprovementRule, ImprovementType } from "../core/types";

export const improvementRules: Record<ImprovementType, ImprovementRule> = {
  farm: {
    label: "Farm",
    allowedTerrains: ["plain", "plateau"],
    yield: {
      food: 1,
      wood: 0,
      stone: 0,
      knowledge: 0,
    },
  },
  lumberCamp: {
    label: "Lumber Camp",
    allowedTerrains: ["hill", "mountain"],
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
    allowedTerrains: ["lake", "plateau"],
    yield: {
      food: 0,
      wood: 0,
      stone: 0,
      knowledge: 1,
    },
  },
};
