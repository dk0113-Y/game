import { describe, expect, it } from "vitest";
import { foundSettlement, moveSettler } from "../game/core/actions";
import { createInitialWorld } from "../game/core/createWorld";
import { getSettler, getTileAt } from "../game/core/selectors";

describe("game core world", () => {
  it("generates the correct number of axial hex tiles", () => {
    const state = createInitialWorld(4, 3);

    expect(state.tiles).toHaveLength(12);
    expect(state.tiles[0]).toMatchObject({ id: "hex-0-0", q: 0, r: 0 });
  });

  it("starts with one settler at the map center", () => {
    const state = createInitialWorld(5, 5);

    expect(state.player.settlers).toHaveLength(1);
    expect(state.player.settlers[0]).toMatchObject({
      id: "settler-1",
      q: 2,
      r: 2,
      movesLeft: 2,
    });
  });

  it("moves a settler to an adjacent hex", () => {
    const state = createInitialWorld(5, 5);
    const nextState = moveSettler(state, "settler-1", 3, 2);
    const settler = getSettler(nextState, "settler-1");

    expect(settler).toMatchObject({ q: 3, r: 2, movesLeft: 1 });
    expect(state.player.settlers[0]).toMatchObject({
      q: 2,
      r: 2,
      movesLeft: 2,
    });
  });

  it("does not move a settler outside the map", () => {
    const state = createInitialWorld(3, 3);

    expect(() => moveSettler(state, "settler-1", -1, 1)).toThrow(
      "outside the map",
    );
  });

  it("does not move a settler to a non-adjacent hex", () => {
    const state = createInitialWorld(5, 5);

    expect(() => moveSettler(state, "settler-1", 4, 2)).toThrow(
      "adjacent hex",
    );
  });

  it("removes the settler and adds a settlement when founding", () => {
    const state = createInitialWorld(5, 5);
    const nextState = foundSettlement(state, "settler-1", "First Home");
    const settlement = nextState.player.settlements[0];
    const tile = getTileAt(nextState, settlement.q, settlement.r);

    expect(nextState.player.settlers).toHaveLength(0);
    expect(nextState.player.settlements).toHaveLength(1);
    expect(settlement).toMatchObject({
      id: "settlement-1",
      name: "First Home",
      q: 2,
      r: 2,
      population: 1,
    });
    expect(tile?.settlementId).toBe("settlement-1");
  });
});
