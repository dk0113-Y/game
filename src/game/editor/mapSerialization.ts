import type { Terrain } from "../core/types";
import type {
  FeatureType,
  MapDefinition,
  MapTileDefinition,
  RoadLevel,
} from "../data/maps/mapTypes";

export const FEATURE_TYPES: FeatureType[] = [
  "none",
  "wild_grain",
  "wild_horse",
  "fish",
  "stone_outcrop",
  "copper_ore",
  "dense_woods",
];

export const ROAD_LEVELS: RoadLevel[] = ["none", "trail", "road"];

export const EDITOR_TERRAINS: Terrain[] = [
  "grassland",
  "forest",
  "hill",
  "river",
  "coast",
];

function isTerrain(value: unknown): value is Terrain {
  return typeof value === "string" && EDITOR_TERRAINS.includes(value as Terrain);
}

function isFeatureType(value: unknown): value is FeatureType {
  return (
    typeof value === "string" && FEATURE_TYPES.includes(value as FeatureType)
  );
}

function isRoadLevel(value: unknown): value is RoadLevel {
  return typeof value === "string" && ROAD_LEVELS.includes(value as RoadLevel);
}

function assertInteger(value: unknown, fieldName: string): number {
  if (!Number.isInteger(value)) {
    throw new Error(`${fieldName} 必须是整数。`);
  }

  return value as number;
}

function parseTile(value: unknown): MapTileDefinition {
  if (!value || typeof value !== "object") {
    throw new Error("地图地块必须是对象。");
  }

  const tile = value as Partial<MapTileDefinition>;
  const q = assertInteger(tile.q, "tile.q");
  const r = assertInteger(tile.r, "tile.r");

  if (!isTerrain(tile.terrain)) {
    throw new Error("tile.terrain 无效。");
  }

  if (!isFeatureType(tile.feature)) {
    throw new Error("tile.feature 无效。");
  }

  if (!isRoadLevel(tile.roadLevel)) {
    throw new Error("tile.roadLevel 无效。");
  }

  return {
    q,
    r,
    terrain: tile.terrain,
    feature: tile.feature,
    roadLevel: tile.roadLevel,
  };
}

export function createBlankMapDefinition(
  width: number,
  height: number,
): MapDefinition {
  if (width <= 0 || height <= 0) {
    throw new Error("地图尺寸必须为正数。");
  }

  const tiles: MapTileDefinition[] = [];

  for (let r = 0; r < height; r += 1) {
    for (let q = 0; q < width; q += 1) {
      tiles.push({
        q,
        r,
        terrain: "grassland",
        feature: "none",
        roadLevel: "none",
      });
    }
  }

  return {
    width,
    height,
    startingPosition: {
      q: Math.floor(width / 2),
      r: Math.floor(height / 2),
    },
    tiles,
  };
}

export function serializeMapDefinition(map: MapDefinition): string {
  return `${JSON.stringify(map, null, 2)}\n`;
}

export function parseMapDefinition(json: string): MapDefinition {
  const parsed = JSON.parse(json) as unknown;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("地图 JSON 必须是对象。");
  }

  const map = parsed as Partial<MapDefinition>;
  const width = assertInteger(map.width, "width");
  const height = assertInteger(map.height, "height");

  if (width <= 0 || height <= 0) {
    throw new Error("地图尺寸必须为正数。");
  }

  if (!map.startingPosition || typeof map.startingPosition !== "object") {
    throw new Error("startingPosition 必须是对象。");
  }

  const startingPosition = {
    q: assertInteger(map.startingPosition.q, "startingPosition.q"),
    r: assertInteger(map.startingPosition.r, "startingPosition.r"),
  };

  if (
    startingPosition.q < 0 ||
    startingPosition.q >= width ||
    startingPosition.r < 0 ||
    startingPosition.r >= height
  ) {
    throw new Error("startingPosition 超出地图范围。");
  }

  if (!Array.isArray(map.tiles)) {
    throw new Error("tiles 必须是数组。");
  }

  const tiles = map.tiles.map(parseTile);
  if (tiles.length !== width * height) {
    throw new Error("tiles 数量与地图尺寸不匹配。");
  }

  for (const tile of tiles) {
    if (tile.q < 0 || tile.q >= width || tile.r < 0 || tile.r >= height) {
      throw new Error("tile 坐标超出地图范围。");
    }
  }

  return {
    width,
    height,
    startingPosition,
    tiles,
  };
}
