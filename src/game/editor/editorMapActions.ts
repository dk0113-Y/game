import { hexToId } from "../core/hex";
import type { MapDefinition, MapTileDefinition } from "../data/maps/mapTypes";
import type { BrushState } from "./editorTypes";

export function tileDefinitionId(tile: Pick<MapTileDefinition, "q" | "r">) {
  return hexToId(tile.q, tile.r);
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

  return {
    ...map,
    tiles: map.tiles.map((currentTile) => {
      if (tileDefinitionId(currentTile) !== tileDefinitionId(tile)) {
        return currentTile;
      }

      if (brush.mode === "terrain") {
        return { ...currentTile, terrain: brush.terrain };
      }

      if (brush.mode === "feature") {
        return { ...currentTile, feature: brush.feature };
      }

      return { ...currentTile, roadLevel: brush.roadLevel };
    }),
  };
}
