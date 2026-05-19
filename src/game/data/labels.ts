import type { Terrain } from "../core/types";
import type { FeatureType, RoadLevel } from "./maps/mapTypes";

export const TERRAIN_LABELS: Record<Terrain, string> = {
  plain: "平原",
  hill: "丘陵",
  plateau: "高原",
  mountain: "山地",
  peak: "山峰",
  lake: "湖泊",
};

export const TERRAIN_SHORT_LABELS: Record<Terrain, string> = {
  plain: "平",
  hill: "丘",
  plateau: "高",
  mountain: "山",
  peak: "峰",
  lake: "湖",
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
