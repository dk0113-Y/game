import { terrainRules } from "../data/terrainRules";
import { isHexAdjacent } from "./hex";
import { getSettler, getTileAt } from "./selectors";
import type { GameState, Settlement } from "./types";

function assertTileExists(state: GameState, q: number, r: number): void {
  if (!getTileAt(state, q, r)) {
    throw new Error("Target tile is outside the map.");
  }
}

export function moveSettler(
  state: GameState,
  settlerId: string,
  targetQ: number,
  targetR: number,
): GameState {
  assertTileExists(state, targetQ, targetR);

  const settler = getSettler(state, settlerId);
  if (!settler) {
    throw new Error("Settler not found.");
  }

  if (settler.movesLeft <= 0) {
    throw new Error("Settler has no moves left.");
  }

  if (
    !isHexAdjacent(
      { q: settler.q, r: settler.r },
      { q: targetQ, r: targetR },
    )
  ) {
    throw new Error("Settler can only move to an adjacent hex.");
  }

  const targetTile = getTileAt(state, targetQ, targetR);
  if (!targetTile) {
    throw new Error("Target tile not found.");
  }

  const moveCost = terrainRules[targetTile.terrain].moveCost;
  if (settler.movesLeft < moveCost) {
    throw new Error("Settler does not have enough moves left.");
  }

  return {
    ...state,
    player: {
      ...state.player,
      settlers: state.player.settlers.map((currentSettler) =>
        currentSettler.id === settlerId
          ? {
              ...currentSettler,
              q: targetQ,
              r: targetR,
              movesLeft: currentSettler.movesLeft - moveCost,
            }
          : currentSettler,
      ),
    },
  };
}

export function foundSettlement(
  state: GameState,
  settlerId: string,
  name: string,
): GameState {
  const settler = getSettler(state, settlerId);
  if (!settler) {
    throw new Error("Settler not found.");
  }

  const tile = getTileAt(state, settler.q, settler.r);
  if (!tile) {
    throw new Error("Settler is not on a valid tile.");
  }

  if (tile.settlementId) {
    throw new Error("Tile already has a settlement.");
  }

  if (!terrainRules[tile.terrain].canFoundSettlement) {
    throw new Error("Cannot found a settlement on this terrain.");
  }

  const settlement: Settlement = {
    id: `settlement-${state.player.settlements.length + 1}`,
    name,
    q: settler.q,
    r: settler.r,
    population: 1,
  };

  return {
    ...state,
    tiles: state.tiles.map((currentTile) =>
      currentTile.id === tile.id
        ? {
            ...currentTile,
            ownerId: state.player.id,
            settlementId: settlement.id,
          }
        : currentTile,
    ),
    player: {
      ...state.player,
      settlers: state.player.settlers.filter(
        (currentSettler) => currentSettler.id !== settlerId,
      ),
      settlements: [...state.player.settlements, settlement],
    },
  };
}

export function endTurn(state: GameState): GameState {
  const settlementCount = state.player.settlements.length;

  return {
    ...state,
    turn: state.turn + 1,
    player: {
      ...state.player,
      food: state.player.food + settlementCount,
      knowledge: state.player.knowledge + settlementCount,
      settlers: state.player.settlers.map((settler) => ({
        ...settler,
        movesLeft: 2,
      })),
    },
  };
}
