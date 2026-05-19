import type { HexCoord, Terrain } from "../../core/types";

export type FeatureType =
  | "none"
  | "wild_grain"
  | "wild_horse"
  | "fish"
  | "stone_outcrop"
  | "copper_ore"
  | "dense_woods";

export type RoadLevel = "none" | "trail" | "road";

export interface MapTileDefinition extends HexCoord {
  terrain: Terrain;
  feature: FeatureType;
  roadLevel: RoadLevel;
}

export interface MapDefinition {
  width: number;
  height: number;
  startingPosition: HexCoord;
  tiles: MapTileDefinition[];
}
