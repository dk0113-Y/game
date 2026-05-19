import { describe, expect, it } from "vitest";
import { applyBrushToTile } from "../game/editor/editorMapActions";
import { createBlankMapDefinition } from "../game/editor/mapSerialization";

describe("editor map actions", () => {
  it("applies a terrain brush to one tile", () => {
    const map = createBlankMapDefinition(3, 3);
    const tile = map.tiles.find((currentTile) => currentTile.displayCol === 1 && currentTile.displayRow === 1);

    expect(tile).toBeDefined();

    const nextMap = applyBrushToTile(map, tile ?? map.tiles[0], {
      mode: "terrain",
      terrain: "mountain",
      feature: "none",
      roadLevel: "none",
    });

    expect(
      nextMap.tiles.filter((currentTile) => currentTile.terrain === "mountain"),
    ).toHaveLength(1);
  });

  it("sets starting position with the starting position brush", () => {
    const map = createBlankMapDefinition(3, 3);
    const tile = map.tiles[0];
    const nextMap = applyBrushToTile(map, tile, {
      mode: "startingPosition",
      terrain: "mountain",
      feature: "wild_horse",
      roadLevel: "road",
    });

    expect(nextMap.startingPosition).toEqual({ q: tile.q, r: tile.r });
    expect(nextMap.tiles).toEqual(map.tiles);
  });
});
