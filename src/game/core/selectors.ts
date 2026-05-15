import type { GameState, Settlement, Settler, Tile } from "./types";

export function getTileAt(
  state: GameState,
  q: number,
  r: number,
): Tile | undefined {
  return state.tiles.find((tile) => tile.q === q && tile.r === r);
}

export function getSettler(
  state: GameState,
  settlerId: string,
): Settler | undefined {
  return state.player.settlers.find((settler) => settler.id === settlerId);
}

export function getSettlement(
  state: GameState,
  settlementId: string,
): Settlement | undefined {
  return state.player.settlements.find(
    (settlement) => settlement.id === settlementId,
  );
}
