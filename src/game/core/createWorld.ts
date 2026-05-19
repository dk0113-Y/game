import { hexToId } from "./hex";
import { createInitialTime } from "./time";
import type { GameState, Terrain, Tile } from "./types";
import type { MapDefinition } from "../data/maps/mapTypes";

const TERRAIN_SEQUENCE: Terrain[] = [
  "plain",
  "hill",
  "plateau",
  "mountain",
  "plain",
  "plain",
  "lake",
];

function createTile(q: number, r: number): Tile {
  return {
    id: hexToId(q, r),
    q,
    r,
    terrain: TERRAIN_SEQUENCE[(q + r) % TERRAIN_SEQUENCE.length],
  };
}

function createInitialPlayerState(q: number, r: number): GameState["player"] {
  return {
    id: "player-1",
    food: 0,
    wood: 0,
    stone: 0,
    knowledge: 0,
    settlers: [
      {
        id: "settler-1",
        q,
        r,
        movesLeft: 2,
      },
    ],
    settlements: [],
  };
}

export function createInitialWorld(width: number, height: number): GameState {
  if (width <= 0 || height <= 0) {
    throw new Error("World dimensions must be positive.");
  }

  const tiles: Tile[] = [];

  for (let r = 0; r < height; r += 1) {
    for (let q = 0; q < width; q += 1) {
      tiles.push(createTile(q, r));
    }
  }

  return {
    width,
    height,
    turn: 1,
    time: createInitialTime(),
    tiles,
    player: createInitialPlayerState(
      Math.floor(width / 2),
      Math.floor(height / 2),
    ),
  };
}

export function createGameStateFromMapDefinition(
  map: MapDefinition,
): GameState {
  return {
    width: map.width,
    height: map.height,
    turn: 1,
    time: createInitialTime(),
    tiles: map.tiles.map((tile) => ({
      id: hexToId(tile.q, tile.r),
      q: tile.q,
      r: tile.r,
      terrain: tile.terrain,
    })),
    player: createInitialPlayerState(
      map.startingPosition.q,
      map.startingPosition.r,
    ),
  };
}
