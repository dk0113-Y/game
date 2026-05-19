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
      grassland: 1,
      forest: 1.8,
      hill: 1.6,
      river: 1.2,
      coast: 1.1,
    },
  },
};
