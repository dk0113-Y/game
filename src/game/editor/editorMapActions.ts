import { hexToId } from "../core/hex";
import type { MapDefinition, MapTileDefinition } from "../data/maps/mapTypes";
import type { BrushState } from "./editorTypes";

export function tileDefinitionId(tile: Pick<MapTileDefinition, "q" | "r">) {
  return hexToId(tile.q, tile.r);
}

export function toggleSelectedTile(
  selectedTileIds: readonly string[],
  tileId: string,
): string[] {
  return selectedTileIds.includes(tileId)
    ? selectedTileIds.filter((selectedTileId) => selectedTileId !== tileId)
    : [...selectedTileIds, tileId];
}

export function addSelectedTile(
  selectedTileIds: readonly string[],
  tileId: string,
): string[] {
  return selectedTileIds.includes(tileId)
    ? [...selectedTileIds]
    : [...selectedTileIds, tileId];
}

export function applyBrushToTiles(
  map: MapDefinition,
  tileIds: Iterable<string>,
  brush: BrushState,
): MapDefinition {
  if (brush.mode === "startingPosition") {
    return map;
  }

  const tileIdSet = new Set(tileIds);

  return {
    ...map,
    tiles: map.tiles.map((tile) => {
      if (!tileIdSet.has(tileDefinitionId(tile))) {
        return tile;
      }

      if (brush.mode === "terrain") {
        return { ...tile, terrain: brush.terrain };
      }

      if (brush.mode === "feature") {
        return { ...tile, feature: brush.feature };
      }

      return { ...tile, roadLevel: brush.roadLevel };
    }),
  };
}

export function applyBrushToTile(
  map: MapDefinition,
  tile: MapTileDefinition,
  brush: BrushState,
): MapDefinition {
  if (brush.mode === "startingPosition") {
    return {
      ...map,
      startingPosition: { q: tile.q, r: tile.r },
    };
  }

  return applyBrushToTiles(map, [tileDefinitionId(tile)], brush);
}
