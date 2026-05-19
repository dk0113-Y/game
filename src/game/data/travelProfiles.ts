import type { Terrain } from "../core/types";

export type TravelProfileId = "walking";

export interface TravelProfile {
  id: TravelProfileId;
  label: string;
  baseKmPerDay: number;
  terrainCostMultiplier: Record<Terrain, number>;
}

export const TILE_DISTANCE_KM = 10;

export const travelProfiles: Record<TravelProfileId, TravelProfile> = {
  walking: {
    id: "walking",
    label: "Walking",
    baseKmPerDay: 25,
    terrainCostMultiplier: {
      plain: 1,
      hill: 1.6,
      plateau: 1.4,
      mountain: 2.4,
      peak: 8,
      lake: 3,
    },
  },
};
