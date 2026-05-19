import { describe, expect, it } from "vitest";
import {
  createBlankMapDefinition,
  parseMapDefinition,
  serializeMapDefinition,
} from "../game/editor/mapSerialization";

describe("map serialization", () => {
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

  it("creates a rectangular visual layout with offset axial coordinates", () => {
    const map = createBlankMapDefinition(10, 10);

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

  it("round trips a map definition through JSON", () => {
    const map = createBlankMapDefinition(2, 2);
    const editedMap = {
      ...map,
      startingPosition: { q: 1, r: 1 },
      tiles: map.tiles.map((tile) =>
        tile.q === 1 && tile.r === 1
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
