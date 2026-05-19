import { describe, expect, it } from "vitest";
import { foundSettlement, moveSettler } from "../game/core/actions";
import { createInitialWorld } from "../game/core/createWorld";
import type { GameState, Terrain } from "../game/core/types";
import { terrainRules } from "../game/data/terrainRules";

function createWorldWithCenterTerrain(terrain: Terrain): GameState {
  const state = createInitialWorld(3, 3);

  return {
    ...state,
    tiles: state.tiles.map((tile) =>
      tile.q === 1 && tile.r === 1 ? { ...tile, terrain } : tile,
    ),
  };
}

describe("terrain rules", () => {
  it("stores plain terrain potential without direct baseYield output", () => {
    expect(terrainRules.plain).toMatchObject({
      label: "平原",
      moveCost: 1,
      canFoundSettlement: true,
      potential: {
        food: 2,
        wood: 0,
        stone: 0,
        knowledge: 0,
      },
    });
    expect("baseYield" in terrainRules.plain).toBe(false);
  });

  it("spends 2 moves when a settler moves into hill", () => {
    const state = createInitialWorld(3, 3);
    const nextState = moveSettler(state, "settler-1", 0, 1);

    expect(nextState.player.settlers[0].movesLeft).toBe(0);
  });

  it("does not enter a high-cost tile without enough moves left", () => {
    const state = createInitialWorld(3, 3);
    const lowMovesState: GameState = {
      ...state,
      player: {
        ...state.player,
        settlers: state.player.settlers.map((settler) => ({
          ...settler,
          movesLeft: 1,
        })),
      },
    };

    expect(() => moveSettler(lowMovesState, "settler-1", 0, 1)).toThrow(
      "enough moves",
    );
  });

  it("allows founding only when terrain canFoundSettlement is true", () => {
    expect(() =>
      foundSettlement(
        createWorldWithCenterTerrain("plain"),
        "settler-1",
        "Founding Test",
      ),
    ).not.toThrow();

    expect(() =>
      foundSettlement(
        createWorldWithCenterTerrain("peak"),
        "settler-1",
        "Blocked Test",
      ),
    ).toThrow("Cannot found");
  });
});
