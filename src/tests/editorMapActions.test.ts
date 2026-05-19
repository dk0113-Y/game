import { describe, expect, it } from "vitest";
import {
  addSelectedTile,
  applyBrushToTiles,
  toggleSelectedTile,
} from "../game/editor/editorMapActions";
import { createBlankMapDefinition } from "../game/editor/mapSerialization";

describe("editor map actions", () => {
  it("toggles a selected tile id", () => {
    expect(toggleSelectedTile([], "hex-1-1")).toEqual(["hex-1-1"]);
    expect(toggleSelectedTile(["hex-1-1"], "hex-1-1")).toEqual([]);
  });

  it("adds a selected tile id without toggling during drag", () => {
    expect(addSelectedTile(["hex-1-1"], "hex-1-1")).toEqual(["hex-1-1"]);
    expect(addSelectedTile(["hex-1-1"], "hex-2-1")).toEqual([
      "hex-1-1",
      "hex-2-1",
    ]);
  });

  it("applies a terrain brush to selected tiles", () => {
    const map = createBlankMapDefinition(3, 3);
    const nextMap = applyBrushToTiles(map, ["hex-1-1", "hex-2-1"], {
      mode: "terrain",
      terrain: "mountain",
      feature: "none",
      roadLevel: "none",
    });

    expect(
      nextMap.tiles.filter((tile) => tile.terrain === "mountain"),
    ).toHaveLength(2);
  });

  it("does not batch apply starting position brush", () => {
    const map = createBlankMapDefinition(3, 3);
    const nextMap = applyBrushToTiles(map, ["hex-0-0"], {
      mode: "startingPosition",
      terrain: "mountain",
      feature: "wild_horse",
      roadLevel: "road",
    });

    expect(nextMap).toEqual(map);
  });
});
