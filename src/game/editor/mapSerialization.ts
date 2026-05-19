import { hexDistance, hexToId } from "../core/hex";
import type { Terrain } from "../core/types";
import type {
  FeatureType,
  MapDefinition,
  MapTileDefinition,
  RoadLevel,
} from "../data/maps/mapTypes";

export const DEFAULT_EDITOR_MAP_WIDTH = 24;
export const DEFAULT_EDITOR_MAP_HEIGHT = 18;

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
    throw new Error(`${fieldName} must be an integer.`);
  }

  return value as number;
}

function parseTile(value: unknown): MapTileDefinition {
  if (!value || typeof value !== "object") {
    throw new Error("Map tile must be an object.");
  }

  const tile = value as Partial<MapTileDefinition>;
  const q = assertInteger(tile.q, "tile.q");
  const r = assertInteger(tile.r, "tile.r");
  const displayCol = assertInteger(tile.displayCol, "tile.displayCol");
  const displayRow = assertInteger(tile.displayRow, "tile.displayRow");

  if (!isTerrain(tile.terrain)) {
    throw new Error("tile.terrain is invalid.");
  }

  if (!isFeatureType(tile.feature)) {
    throw new Error("tile.feature is invalid.");
  }

  if (!isRoadLevel(tile.roadLevel)) {
    throw new Error("tile.roadLevel is invalid.");
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

function createBaseMapDefinition(
  width: number,
  height: number,
  terrainForTile: (tile: Pick<MapTileDefinition, "displayCol" | "displayRow" | "q" | "r">) => Terrain,
): MapDefinition {
  if (width <= 0 || height <= 0) {
    throw new Error("Map dimensions must be positive.");
  }

  const tiles: MapTileDefinition[] = [];

  for (let displayRow = 0; displayRow < height; displayRow += 1) {
    for (let displayCol = 0; displayCol < width; displayCol += 1) {
      const axial = offsetToAxial(displayCol, displayRow);
      const tileBase = {
        ...axial,
        displayCol,
        displayRow,
      };

      tiles.push({
        ...tileBase,
        terrain: terrainForTile(tileBase),
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

export function createBlankMapDefinition(
  width: number = DEFAULT_EDITOR_MAP_WIDTH,
  height: number = DEFAULT_EDITOR_MAP_HEIGHT,
): MapDefinition {
  return createBaseMapDefinition(width, height, () => "plain");
}

export function createTerrainRingMapDefinition(
  width: number = DEFAULT_EDITOR_MAP_WIDTH,
  height: number = DEFAULT_EDITOR_MAP_HEIGHT,
): MapDefinition {
  const center = offsetToAxial(Math.floor(width / 2), Math.floor(height / 2));

  return createBaseMapDefinition(width, height, (tile) => {
    const distanceFromCenter = hexDistance(tile, center);
    const edgeDistance = Math.min(
      tile.displayCol,
      tile.displayRow,
      width - 1 - tile.displayCol,
      height - 1 - tile.displayRow,
    );

    if (
      tile.displayCol >= width - 5 &&
      tile.displayRow >= Math.floor(height * 0.58)
    ) {
      return "lake";
    }

    if (edgeDistance === 0 && (tile.displayCol + tile.displayRow) % 3 === 0) {
      return "peak";
    }

    if (distanceFromCenter <= 3) {
      return "plain";
    }

    if (distanceFromCenter <= 5) {
      return "hill";
    }

    if (distanceFromCenter <= 7) {
      return "plateau";
    }

    return "mountain";
  });
}

export function serializeMapDefinition(map: MapDefinition): string {
  return `${JSON.stringify(map, null, 2)}\n`;
}

export function parseMapDefinition(json: string): MapDefinition {
  const parsed = JSON.parse(json) as unknown;
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Map JSON must be an object.");
  }

  const map = parsed as Partial<MapDefinition>;
  const width = assertInteger(map.width, "width");
  const height = assertInteger(map.height, "height");

  if (width <= 0 || height <= 0) {
    throw new Error("Map dimensions must be positive.");
  }

  if (!map.startingPosition || typeof map.startingPosition !== "object") {
    throw new Error("startingPosition must be an object.");
  }

  const startingPosition = {
    q: assertInteger(map.startingPosition.q, "startingPosition.q"),
    r: assertInteger(map.startingPosition.r, "startingPosition.r"),
  };

  if (!Array.isArray(map.tiles)) {
    throw new Error("tiles must be an array.");
  }

  const tiles = map.tiles.map(parseTile);
  if (tiles.length !== width * height) {
    throw new Error("tiles length does not match map dimensions.");
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
      throw new Error("tile display coordinate is outside the map.");
    }

    const expectedAxial = offsetToAxial(tile.displayCol, tile.displayRow);
    if (tile.q !== expectedAxial.q || tile.r !== expectedAxial.r) {
      throw new Error("tile axial coordinate does not match display coordinate.");
    }

    const tileId = hexToId(tile.q, tile.r);
    const displayId = `${tile.displayCol},${tile.displayRow}`;
    if (tileIds.has(tileId) || displayIds.has(displayId)) {
      throw new Error("map contains duplicate tiles.");
    }

    tileIds.add(tileId);
    displayIds.add(displayId);
  }

  if (!tileIds.has(hexToId(startingPosition.q, startingPosition.r))) {
    throw new Error("startingPosition is outside the map.");
  }

  return {
    width,
    height,
    startingPosition,
    tiles,
  };
}
