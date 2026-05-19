import { describe, expect, it } from "vitest";
import { hexToId } from "../game/core/hex";
import { createGameStateFromMapDefinition } from "../game/core/createWorld";
import { createBlankMapDefinition } from "../game/editor/mapSerialization";

describe("map definition world creation", () => {
  it("keeps the map tile count", () => {
    const map = createBlankMapDefinition(4, 3);
    const state = createGameStateFromMapDefinition(map);

    expect(state.tiles).toHaveLength(map.tiles.length);
  });

  it("places the initial settler at the map starting position", () => {
    const map = createBlankMapDefinition(4, 3);
    const state = createGameStateFromMapDefinition(map);

    expect(state.player.settlers).toHaveLength(1);
    expect(state.player.settlers[0]).toMatchObject({
      id: "settler-1",
      q: map.startingPosition.q,
      r: map.startingPosition.r,
    });
  });

  it("preserves terrain from map tiles", () => {
    const map = createBlankMapDefinition(4, 3);
    const editedTile = map.tiles[1];
    const editedMap = {
      ...map,
      tiles: map.tiles.map((tile) =>
        tile === editedTile ? { ...tile, terrain: "lake" as const } : tile,
      ),
    };

    const state = createGameStateFromMapDefinition(editedMap);
    const gameTile = state.tiles.find(
      (tile) => tile.id === hexToId(editedTile.q, editedTile.r),
    );

    expect(gameTile?.terrain).toBe("lake");
  });
});
