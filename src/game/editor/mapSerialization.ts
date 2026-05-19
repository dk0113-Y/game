import { hexToId } from "../core/hex";
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
  "plain",
  "hill",
  "plateau",
  "mountain",
  "peak",
  "lake",
];

export function offsetToAxial(displayCol: number, displayRow: number) {
  return {
    q: displayCol - Math.floor(displayRow / 2),
    r: displayRow,
  };
}

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
  const displayCol = assertInteger(tile.displayCol, "tile.displayCol");
  const displayRow = assertInteger(tile.displayRow, "tile.displayRow");

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
    displayCol,
    displayRow,
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

  for (let displayRow = 0; displayRow < height; displayRow += 1) {
    for (let displayCol = 0; displayCol < width; displayCol += 1) {
      const axial = offsetToAxial(displayCol, displayRow);

      tiles.push({
        ...axial,
        displayCol,
        displayRow,
        terrain: "plain",
        feature: "none",
        roadLevel: "none",
      });
    }
  }

  const startDisplayCol = Math.floor(width / 2);
  const startDisplayRow = Math.floor(height / 2);

  return {
    width,
    height,
    startingPosition: offsetToAxial(startDisplayCol, startDisplayRow),
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

  if (!Array.isArray(map.tiles)) {
    throw new Error("tiles 必须是数组。");
  }

  const tiles = map.tiles.map(parseTile);
  if (tiles.length !== width * height) {
    throw new Error("tiles 数量与地图尺寸不匹配。");
  }

  const tileIds = new Set<string>();
  const displayIds = new Set<string>();
  for (const tile of tiles) {
    if (
      tile.displayCol < 0 ||
      tile.displayCol >= width ||
      tile.displayRow < 0 ||
      tile.displayRow >= height
    ) {
      throw new Error("tile 视觉坐标超出地图范围。");
    }

    const expectedAxial = offsetToAxial(tile.displayCol, tile.displayRow);
    if (tile.q !== expectedAxial.q || tile.r !== expectedAxial.r) {
      throw new Error("tile 轴向坐标与视觉坐标不匹配。");
    }

    const tileId = hexToId(tile.q, tile.r);
    const displayId = `${tile.displayCol},${tile.displayRow}`;
    if (tileIds.has(tileId) || displayIds.has(displayId)) {
      throw new Error("地图包含重复地块。");
    }

    tileIds.add(tileId);
    displayIds.add(displayId);
  }

  if (!tileIds.has(hexToId(startingPosition.q, startingPosition.r))) {
    throw new Error("startingPosition 超出地图范围。");
  }

  return {
    width,
    height,
    startingPosition,
    tiles,
  };
}
