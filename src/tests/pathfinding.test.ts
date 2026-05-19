import { describe, expect, it } from "vitest";
import { startTravel } from "../game/core/actions";
import { createInitialWorld } from "../game/core/createWorld";
import {
  findPath,
  getTileTravelCostDays,
} from "../game/core/pathfinding";
import { getSettler, getTileAt } from "../game/core/selectors";
import { advanceOneDay } from "../game/core/time";
import type { GameState, Terrain } from "../game/core/types";

function createWorldWithTerrain(
  width: number,
  height: number,
  terrain: Terrain,
): GameState {
  const state = createInitialWorld(width, height);

  return {
    ...state,
    tiles: state.tiles.map((tile) => ({ ...tile, terrain })),
  };
}

describe("pathfinding and travel tasks", () => {
  it("finds an adjacent path", () => {
    const state = createWorldWithTerrain(3, 3, "plain");
    const path = findPath(state, { q: 1, r: 1 }, { q: 2, r: 1 }, "walking");

    expect(path).toEqual([
      { q: 1, r: 1 },
      { q: 2, r: 1 },
    ]);
  });

  it("finds a multi-hex path", () => {
    const state = createWorldWithTerrain(5, 5, "plain");
    const path = findPath(state, { q: 1, r: 1 }, { q: 4, r: 1 }, "walking");

    expect(path[0]).toEqual({ q: 1, r: 1 });
    expect(path[path.length - 1]).toEqual({ q: 4, r: 1 });
    expect(path.length).toBeGreaterThan(2);
  });

  it("assigns higher travel cost to mountain than plain", () => {
    const state = createInitialWorld(3, 3);
    const plainTile = getTileAt(
      createWorldWithTerrain(3, 3, "plain"),
      1,
      1,
    );
    const mountainTile = getTileAt(
      createWorldWithTerrain(3, 3, "mountain"),
      1,
      1,
    );

    expect(plainTile).toBeDefined();
    expect(mountainTile).toBeDefined();
    expect(
      getTileTravelCostDays(mountainTile ?? state.tiles[0], "walking"),
    ).toBeGreaterThan(
      getTileTravelCostDays(plainTile ?? state.tiles[0], "walking"),
    );
  });

  it("writes a travel task when starting travel", () => {
    const state = createWorldWithTerrain(5, 5, "plain");
    const nextState = startTravel(state, "settler-1", 4, 2);
    const settler = getSettler(nextState, "settler-1");
    const task = settler?.currentTask;
    const path = task?.path ?? [];

    expect(task).toMatchObject({
      type: "travel",
      currentSegmentIndex: 0,
      progressOnSegmentDays: 0,
      profileId: "walking",
    });
    expect(path[0]).toEqual({ q: 2, r: 2 });
    expect(path[path.length - 1]).toEqual({ q: 4, r: 2 });
  });

  it("advances travel on daily tick", () => {
    const state = startTravel(
      createWorldWithTerrain(10, 5, "plain"),
      "settler-1",
      9,
      2,
    );
    const nextState = advanceOneDay(state);
    const settler = getSettler(nextState, "settler-1");

    expect(settler?.q).toBeGreaterThan(5);
    expect(settler?.currentTask).toBeDefined();
  });

  it("clears the travel task after reaching the destination", () => {
    const state = startTravel(
      createWorldWithTerrain(5, 5, "plain"),
      "settler-1",
      3,
      2,
    );
    const nextState = advanceOneDay(state);
    const settler = getSettler(nextState, "settler-1");

    expect(settler).toMatchObject({ q: 3, r: 2 });
    expect(settler?.currentTask).toBeUndefined();
  });
});
