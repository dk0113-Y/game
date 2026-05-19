import { useEffect, useMemo, useRef, useState } from "react";
import { foundSettlement, startTravel } from "../core/actions";
import {
  createGameStateFromMapDefinition,
  createInitialWorld,
} from "../core/createWorld";
import { hexToId } from "../core/hex";
import { getTravelTaskRemainingDays } from "../core/pathfinding";
import { getTileAt } from "../core/selectors";
import { advanceDays, setSpeed, togglePause } from "../core/time";
import type { GameSpeed, GameState, Settler, Tile } from "../core/types";
import { readEditorDraftMap } from "../editor/editorDraftStorage";
import { GridMap } from "./GridMap";
import { SidePanel } from "./SidePanel";

const DAYS_PER_SECOND: Record<GameSpeed, number> = {
  0: 0,
  1: 0.5,
  2: 1,
  3: 3,
  4: 7,
  5: 15,
};

const SPEED_OPTIONS: GameSpeed[] = [1, 2, 3, 4, 5];

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
  const initialDraft = useMemo(() => readEditorDraftMap(), []);
  const draftMap = initialDraft?.ok ? initialDraft.map : undefined;
  const [gameState, setGameState] = useState(() => createInitialWorld(10, 10));
  const [selectedTileId, setSelectedTileId] = useState<string | undefined>(
    "hex-5-5",
  );
  const [selectedSettlerId, setSelectedSettlerId] = useState<
    string | undefined
  >("settler-1");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(() =>
    initialDraft && !initialDraft.ok
      ? "编辑器草稿解析失败，仍可使用默认地图开局。"
      : undefined,
  );
  const accumulatedDaysRef = useRef(0);

  const selectedTile = useMemo(
    () => gameState.tiles.find((tile) => tile.id === selectedTileId),
    [gameState.tiles, selectedTileId],
  );
  const selectedTileSettler = getSettlerAt(gameState, selectedTile);
  const selectedSettler =
    gameState.player.settlers.find(
      (settler) => settler.id === selectedSettlerId,
    ) ?? selectedTileSettler;
  const selectedSettlement = selectedTile?.settlementId
    ? gameState.player.settlements.find(
        (settlement) => settlement.id === selectedTile.settlementId,
      )
    : undefined;
  const selectedTravelPath = selectedSettler?.currentTask?.path ?? [];
  const selectedTravelRemainingDays = selectedSettler?.currentTask
    ? Math.ceil(
        getTravelTaskRemainingDays(gameState, selectedSettler.currentTask),
      )
    : undefined;

  useEffect(() => {
    if (gameState.time.paused || gameState.time.speed === 0) {
      accumulatedDaysRef.current = 0;
      return;
    }

    let lastTick = performance.now();
    const intervalId = window.setInterval(() => {
      const now = performance.now();
      const elapsedSeconds = (now - lastTick) / 1000;
      lastTick = now;
      accumulatedDaysRef.current +=
        elapsedSeconds * DAYS_PER_SECOND[gameState.time.speed];

      const fullDays = Math.floor(accumulatedDaysRef.current);
      if (fullDays <= 0) {
        return;
      }

      accumulatedDaysRef.current -= fullDays;
      setGameState((currentState) => advanceDays(currentState, fullDays));
    }, 100);

    return () => window.clearInterval(intervalId);
  }, [gameState.time.paused, gameState.time.speed]);

  function handleTileClick(tile: Tile) {
    const targetSettler = getSettlerAt(gameState, tile);

    if (
      selectedSettler &&
      (selectedSettler.q !== tile.q || selectedSettler.r !== tile.r) &&
      !targetSettler
    ) {
      try {
        const nextState = startTravel(
          gameState,
          selectedSettler.id,
          tile.q,
          tile.r,
        );
        setGameState(nextState);
        setSelectedSettlerId(selectedSettler.id);
        setSelectedTileId(tile.id);
        setErrorMessage(undefined);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "无法开始旅行。");
      }
      return;
    }

    setSelectedTileId(tile.id);
    setSelectedSettlerId(targetSettler?.id);
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
        "初火营地",
      );
      const settlementTile = getTileAt(
        nextState,
        selectedSettler.q,
        selectedSettler.r,
      );
      setGameState(nextState);
      setSelectedSettlerId(undefined);
      setSelectedTileId(settlementTile?.id);
      setErrorMessage(undefined);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "无法建立营地。");
    }
  }

  function handleTogglePause() {
    setGameState((currentState) => togglePause(currentState));
    setErrorMessage(undefined);
  }

  function handleSetSpeed(speed: GameSpeed) {
    setGameState((currentState) => setSpeed(currentState, speed));
    setErrorMessage(undefined);
  }

  function handleUseEditorDraftMap() {
    if (!draftMap) {
      return;
    }

    const nextState = createGameStateFromMapDefinition(draftMap);
    setGameState(nextState);
    setSelectedTileId(
      hexToId(draftMap.startingPosition.q, draftMap.startingPosition.r),
    );
    setSelectedSettlerId("settler-1");
    setErrorMessage(undefined);
    accumulatedDaysRef.current = 0;
  }

  return (
    <main className="game-shell">
      <header className="game-header">
        <div>
          <h1>部族至王国</h1>
          <div className="resource-bar" aria-label="玩家资源">
            <span className="resource-pill">
              第 {gameState.time.year} 年 {gameState.time.month} 月{" "}
              {gameState.time.dayOfMonth} 日
            </span>
            <span className="resource-pill">
              {gameState.time.paused ? "已暂停" : "运行中"}
            </span>
            <span className="resource-pill">速度 {gameState.time.speed}</span>
            <span className="resource-pill">食物 {gameState.player.food}</span>
            <span className="resource-pill">木材 {gameState.player.wood}</span>
            <span className="resource-pill">石料 {gameState.player.stone}</span>
            <span className="resource-pill">知识 {gameState.player.knowledge}</span>
          </div>
        </div>
        <div className="time-controls" aria-label="时间控制">
          {draftMap ? (
            <button
              className="turn-button"
              onClick={handleUseEditorDraftMap}
              type="button"
            >
              使用编辑器草稿开局
            </button>
          ) : null}
          <button className="turn-button" type="button" onClick={handleTogglePause}>
            {gameState.time.paused ? "继续" : "暂停"}
          </button>
          <div className="speed-controls" aria-label="游戏速度">
            {SPEED_OPTIONS.map((speed) => (
              <button
                className={
                  gameState.time.speed === speed
                    ? "speed-button active"
                    : "speed-button"
                }
                key={speed}
                onClick={() => handleSetSpeed(speed)}
                type="button"
              >
                {speed}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="game-layout">
        <div className="map-wrap">
          <GridMap
            state={gameState}
            selectedTileId={selectedTileId}
            onTileClick={handleTileClick}
            travelPath={selectedTravelPath}
          />
        </div>
        <SidePanel
          errorMessage={errorMessage}
          selectedSettlement={selectedSettlement}
          selectedSettler={selectedSettler}
          selectedTile={selectedTile}
          travelRemainingDays={selectedTravelRemainingDays}
          onFoundSettlement={handleFoundSettlement}
        />
      </div>
    </main>
  );
}
