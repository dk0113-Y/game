import { describe, expect, it } from "vitest";
import { endTurn, foundSettlement } from "../game/core/actions";
import { createInitialWorld } from "../game/core/createWorld";
import { getHexNeighbors } from "../game/core/hex";
import { getTileAt } from "../game/core/selectors";
import type { GameState, Terrain } from "../game/core/types";

function createWorldWithCenterTerrain(terrain: Terrain): GameState {
  const state = createInitialWorld(5, 5);

  return {
    ...state,
    tiles: state.tiles.map((tile) =>
      tile.q === 2 && tile.r === 2 ? { ...tile, terrain } : tile,
    ),
  };
}

describe("settlements", () => {
  it("claims only the current tile after founding", () => {
    const state = createInitialWorld(5, 5);
    const nextState = foundSettlement(state, "settler-1", "First Home");
    const settlement = nextState.player.settlements[0];
    const settlementTile = getTileAt(nextState, settlement.q, settlement.r);
    const neighborTiles = getHexNeighbors(settlement)
      .map((coord) => getTileAt(nextState, coord.q, coord.r))
      .filter((tile) => tile !== undefined);

    expect(settlementTile).toMatchObject({
      ownerId: nextState.player.id,
      settlementId: settlement.id,
    });
    expect(neighborTiles).not.toHaveLength(0);
    expect(
      neighborTiles.every(
        (tile) => !tile.ownerId && !tile.settlementId,
      ),
    ).toBe(true);
  });

  it("does not produce resources directly from terrain on endTurn", () => {
    const state = foundSettlement(
      createWorldWithCenterTerrain("hill"),
      "settler-1",
      "Hill Home",
    );
    const nextState = endTurn(state);

    expect(nextState.player.food).toBe(1);
    expect(nextState.player.wood).toBe(0);
    expect(nextState.player.stone).toBe(0);
    expect(nextState.player.knowledge).toBe(1);
  });

  it("provides food and knowledge from settlement activity each turn", () => {
    const state = foundSettlement(
      createInitialWorld(5, 5),
      "settler-1",
      "First Home",
    );
    const nextState = endTurn(state);

    expect(nextState.turn).toBe(2);
    expect(nextState.player.food).toBe(1);
    expect(nextState.player.knowledge).toBe(1);
  });
});
