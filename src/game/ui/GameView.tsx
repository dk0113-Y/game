import { useMemo, useState } from "react";
import { endTurn, foundSettlement, moveSettler } from "../core/actions";
import { createInitialWorld } from "../core/createWorld";
import { isHexAdjacent } from "../core/hex";
import { getTileAt } from "../core/selectors";
import type { GameState, Settler, Tile } from "../core/types";
import { GridMap } from "./GridMap";
import { SidePanel } from "./SidePanel";

function getSettlerAt(
  state: GameState,
  tile: Tile | undefined,
): Settler | undefined {
  if (!tile) {
    return undefined;
  }

  return state.player.settlers.find(
    (settler) => settler.q === tile.q && settler.r === tile.r,
  );
}

export function GameView() {
  const [gameState, setGameState] = useState(() => createInitialWorld(10, 10));
  const [selectedTileId, setSelectedTileId] = useState<string | undefined>(
    "hex-5-5",
  );
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const selectedTile = useMemo(
    () => gameState.tiles.find((tile) => tile.id === selectedTileId),
    [gameState.tiles, selectedTileId],
  );
  const selectedSettler = getSettlerAt(gameState, selectedTile);
  const selectedSettlement = selectedTile?.settlementId
    ? gameState.player.settlements.find(
        (settlement) => settlement.id === selectedTile.settlementId,
      )
    : undefined;

  function handleTileClick(tile: Tile) {
    const selectedTileSettler = getSettlerAt(gameState, selectedTile);
    const targetSettler = getSettlerAt(gameState, tile);

    if (
      selectedTile &&
      selectedTileSettler &&
      selectedTile.id !== tile.id &&
      !targetSettler &&
      isHexAdjacent(selectedTile, tile)
    ) {
      try {
        const nextState = moveSettler(
          gameState,
          selectedTileSettler.id,
          tile.q,
          tile.r,
        );
        setGameState(nextState);
        setSelectedTileId(tile.id);
        setErrorMessage(undefined);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to move settler.",
        );
      }
      return;
    }

    setSelectedTileId(tile.id);
    setErrorMessage(undefined);
  }

  function handleFoundSettlement() {
    if (!selectedSettler) {
      return;
    }

    try {
      const nextState = foundSettlement(
        gameState,
        selectedSettler.id,
        "First Hearth",
      );
      const settlementTile = getTileAt(
        nextState,
        selectedSettler.q,
        selectedSettler.r,
      );
      setGameState(nextState);
      setSelectedTileId(settlementTile?.id);
      setErrorMessage(undefined);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to found settlement.",
      );
    }
  }

  function handleEndTurn() {
    setGameState((currentState) => endTurn(currentState));
    setErrorMessage(undefined);
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <div>
          <h1>Tribe to Realm</h1>
          <div className="resource-bar" aria-label="Player resources">
            <span className="resource-pill">Turn {gameState.turn}</span>
            <span className="resource-pill">Food {gameState.player.food}</span>
            <span className="resource-pill">Wood {gameState.player.wood}</span>
            <span className="resource-pill">Stone {gameState.player.stone}</span>
            <span className="resource-pill">
              Knowledge {gameState.player.knowledge}
            </span>
          </div>
        </div>
        <button className="turn-button" type="button" onClick={handleEndTurn}>
          Next Turn
        </button>
      </header>

      <div className="game-layout">
        <div className="map-wrap">
          <GridMap
            state={gameState}
            selectedTileId={selectedTileId}
            onTileClick={handleTileClick}
          />
        </div>
        <SidePanel
          errorMessage={errorMessage}
          selectedSettlement={selectedSettlement}
          selectedSettler={selectedSettler}
          selectedTile={selectedTile}
          onFoundSettlement={handleFoundSettlement}
        />
      </div>
    </main>
  );
}
