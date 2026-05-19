import type { Terrain } from "../core/types";
import type { FeatureType, RoadLevel } from "../data/maps/mapTypes";

export type BrushMode = "terrain" | "feature" | "road" | "startingPosition";

export interface BrushState {
  mode: BrushMode;
  terrain: Terrain;
  feature: FeatureType;
  roadLevel: RoadLevel;
}
