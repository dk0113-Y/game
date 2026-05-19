import type { Terrain } from "../core/types";
import type { FeatureType, RoadLevel } from "./maps/mapTypes";

export const TERRAIN_LABELS: Record<Terrain, string> = {
  grassland: "草原",
  forest: "森林",
  hill: "丘陵",
  river: "河流",
  coast: "海岸",
};

export const TERRAIN_SHORT_LABELS: Record<Terrain, string> = {
  grassland: "草",
  forest: "林",
  hill: "丘",
  river: "河",
  coast: "岸",
};

export const FEATURE_LABELS: Record<FeatureType, string> = {
  none: "无",
  wild_grain: "野生谷物",
  wild_horse: "野马群",
  fish: "鱼群",
  stone_outcrop: "裸露石材",
  copper_ore: "铜矿",
  dense_woods: "密林",
};

export const ROAD_LEVEL_LABELS: Record<RoadLevel, string> = {
  none: "无道路",
  trail: "小径",
  road: "道路",
};

export const BRUSH_MODE_LABELS = {
  terrain: "地形",
  feature: "特征",
  road: "道路",
  startingPosition: "起始点",
} as const;
