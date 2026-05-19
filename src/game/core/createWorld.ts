import { hexToId } from "./hex";
import { createInitialTime } from "./time";
import type { GameState, Terrain, Tile } from "./types";

const TERRAIN_SEQUENCE: Terrain[] = [
  "grassland",
  "forest",
  "hill",
  "river",
  "coast",
];

function createTile(q: number, r: number): Tile {
  return {
    id: hexToId(q, r),
    q,
    r,
    terrain: TERRAIN_SEQUENCE[(q + r) % TERRAIN_SEQUENCE.length],
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
    player: {
      id: "player-1",
      food: 0,
      wood: 0,
      stone: 0,
      knowledge: 0,
      settlers: [
        {
          id: "settler-1",
          q: Math.floor(width / 2),
          r: Math.floor(height / 2),
          movesLeft: 2,
        },
      ],
      settlements: [],
    },
  };
}
