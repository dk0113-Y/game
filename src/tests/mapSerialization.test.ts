import { describe, expect, it } from "vitest";
import { hexToId } from "../game/core/hex";
import {
  createBlankMapDefinition,
  createTerrainRingMapDefinition,
  parseMapDefinition,
  serializeMapDefinition,
} from "../game/editor/mapSerialization";

describe("map serialization", () => {
  it("creates the default terrain ring map at 24x18", () => {
    const map = createTerrainRingMapDefinition();

    expect(map).toMatchObject({
      width: 24,
      height: 18,
    });
    expect(map.tiles).toHaveLength(432);
  });

  it("creates a rectangular visual layout with fixed row width", () => {
    const map = createTerrainRingMapDefinition(10, 10);

    expect(map.tiles).toHaveLength(100);
    for (let row = 0; row < 10; row += 1) {
      expect(map.tiles.filter((tile) => tile.displayRow === row)).toHaveLength(
        10,
      );
    }
    expect(map.tiles.find((tile) => tile.displayCol === 0 && tile.displayRow === 1))
      .toMatchObject({ q: 0, r: 1 });
    expect(map.tiles.find((tile) => tile.displayCol === 0 && tile.displayRow === 2))
      .toMatchObject({ q: -1, r: 2 });
  });

  it("terrain ring template contains all base terrains", () => {
    const map = createTerrainRingMapDefinition();
    const terrains = new Set(map.tiles.map((tile) => tile.terrain));

    expect(terrains).toEqual(
      new Set(["plain", "hill", "plateau", "mountain", "peak", "lake"]),
    );
  });

  it("places the starting position on plain terrain", () => {
    const map = createTerrainRingMapDefinition();
    const startTile = map.tiles.find(
      (tile) => hexToId(tile.q, tile.r) === hexToId(map.startingPosition.q, map.startingPosition.r),
    );

    expect(startTile).toMatchObject({ terrain: "plain" });
  });

  it("creates a blank map definition", () => {
    const map = createBlankMapDefinition(4, 3);

    expect(map).toMatchObject({
      width: 4,
      height: 3,
      startingPosition: { q: 2, r: 1 },
    });
    expect(map.tiles).toHaveLength(12);
    expect(map.tiles[0]).toMatchObject({
      q: 0,
      r: 0,
      displayCol: 0,
      displayRow: 0,
      terrain: "plain",
      feature: "none",
      roadLevel: "none",
    });
  });

  it("round trips a map definition through JSON", () => {
    const map = createTerrainRingMapDefinition(6, 5);
    const editedMap = {
      ...map,
      tiles: map.tiles.map((tile) =>
        tile.displayCol === 1 && tile.displayRow === 1
          ? {
              ...tile,
              terrain: "mountain" as const,
              feature: "wild_horse" as const,
              roadLevel: "trail" as const,
            }
          : tile,
      ),
    };

    expect(parseMapDefinition(serializeMapDefinition(editedMap))).toEqual(
      editedMap,
    );
  });
});
