import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { hexToId } from "../core/hex";
import type { Terrain } from "../core/types";
import {
  BRUSH_MODE_LABELS,
  FEATURE_LABELS,
  ROAD_LEVEL_LABELS,
  TERRAIN_LABELS,
  TERRAIN_SHORT_LABELS,
} from "../data/labels";
import type {
  FeatureType,
  MapDefinition,
  MapTileDefinition,
  RoadLevel,
} from "../data/maps/mapTypes";
import { EditorSidePanel } from "./EditorSidePanel";
import { EditorToolbar } from "./EditorToolbar";
import {
  readEditorDraftMap,
  saveEditorDraftMap,
} from "./editorDraftStorage";
import {
  areMapDefinitionsEqual,
  canRedo,
  canUndo,
  createEditorHistory,
  pushHistory,
  redoHistory,
  undoHistory,
  type EditorHistory,
} from "./editorHistory";
import { applyBrushToTile, tileDefinitionId } from "./editorMapActions";
import type { BrushMode, BrushState } from "./editorTypes";
import {
  createBlankMapDefinition,
  createTerrainRingMapDefinition,
  parseMapDefinition,
  serializeMapDefinition,
} from "./mapSerialization";

const HEX_SIZE = 36;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_HEIGHT = 2 * HEX_SIZE;
const HEX_VERTICAL_STEP = HEX_HEIGHT * 0.75;
const ODD_ROW_OFFSET = HEX_WIDTH / 2;
const MAP_PADDING = 18;

interface InitialEditorState {
  map: MapDefinition;
  errorMessage?: string;
}

interface EditorViewState {
  history: EditorHistory;
  selectedTileId: string;
  dirty: boolean;
  lastSavedAt?: string;
  errorMessage?: string;
}

type EditorViewAction =
  | {
      type: "paintPresent";
      brush: BrushState;
      tile: MapTileDefinition;
    }
  | {
      type: "commitDrag";
      dragStartMap: MapDefinition;
    }
  | {
      type: "pushMap";
      nextMap: MapDefinition;
      selectedTileId?: string;
    }
  | {
      type: "undo";
    }
  | {
      type: "redo";
    }
  | {
      type: "saveSucceeded";
      savedAt: string;
    }
  | {
      type: "setError";
      errorMessage: string;
    }
  | {
      type: "clearError";
    };

function getHexPosition(tile: MapTileDefinition): CSSProperties {
  return {
    left:
      MAP_PADDING +
      tile.displayCol * HEX_WIDTH +
      (tile.displayRow % 2 === 1 ? ODD_ROW_OFFSET : 0),
    top: MAP_PADDING + HEX_VERTICAL_STEP * tile.displayRow,
    width: HEX_WIDTH,
    height: HEX_HEIGHT,
  };
}

function getTileFromPointer(
  event: PointerEvent<HTMLElement>,
  tilesById: Map<string, MapTileDefinition>,
) {
  const target = document.elementFromPoint(event.clientX, event.clientY);
  const tileElement = target?.closest<HTMLElement>("[data-tile-id]");
  const tileId = tileElement?.dataset.tileId;

  return tileId ? tilesById.get(tileId) : undefined;
}

function createDefaultEditorMap() {
  return createTerrainRingMapDefinition();
}

function getStartingTileId(map: MapDefinition) {
  return hexToId(map.startingPosition.q, map.startingPosition.r);
}

function mapContainsTileId(map: MapDefinition, tileId: string) {
  return map.tiles.some((tile) => tileDefinitionId(tile) === tileId);
}

function getValidSelectedTileId(map: MapDefinition, selectedTileId: string) {
  return mapContainsTileId(map, selectedTileId)
    ? selectedTileId
    : getStartingTileId(map);
}

function createInitialEditorState(): InitialEditorState {
  const defaultMap = createDefaultEditorMap();

  if (typeof window === "undefined") {
    return { map: defaultMap };
  }

  const draft = readEditorDraftMap();
  if (!draft) {
    return { map: defaultMap };
  }

  if (draft.ok) {
    return { map: draft.map };
  }

  return {
    map: defaultMap,
    errorMessage: "草稿解析失败，已加载默认地形环带模板。",
  };
}

function formatSavedTime(date: Date) {
  return date.toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function createEditorViewState(initial: InitialEditorState): EditorViewState {
  return {
    history: createEditorHistory(initial.map),
    selectedTileId: getStartingTileId(initial.map),
    dirty: false,
    errorMessage: initial.errorMessage,
  };
}

function editorViewReducer(
  state: EditorViewState,
  action: EditorViewAction,
): EditorViewState {
  if (action.type === "paintPresent") {
    const nextMap = applyBrushToTile(
      state.history.present,
      action.tile,
      action.brush,
    );
    const changed = !areMapDefinitionsEqual(state.history.present, nextMap);

    return {
      ...state,
      history: changed
        ? {
            ...state.history,
            present: nextMap,
          }
        : state.history,
      selectedTileId: tileDefinitionId(action.tile),
      dirty: state.dirty || changed,
      errorMessage: undefined,
    };
  }

  if (action.type === "commitDrag") {
    if (areMapDefinitionsEqual(action.dragStartMap, state.history.present)) {
      return state;
    }

    return {
      ...state,
      history: {
        past: [...state.history.past, action.dragStartMap],
        present: state.history.present,
        future: [],
      },
      dirty: true,
    };
  }

  if (action.type === "pushMap") {
    const nextHistory = pushHistory(state.history, action.nextMap);
    const changed = nextHistory !== state.history;

    return {
      ...state,
      history: nextHistory,
      selectedTileId:
        action.selectedTileId ??
        getValidSelectedTileId(nextHistory.present, state.selectedTileId),
      dirty: state.dirty || changed,
      errorMessage: undefined,
    };
  }

  if (action.type === "undo") {
    const nextHistory = undoHistory(state.history);
    if (nextHistory === state.history) {
      return state;
    }

    return {
      ...state,
      history: nextHistory,
      selectedTileId: getValidSelectedTileId(
        nextHistory.present,
        state.selectedTileId,
      ),
      dirty: true,
      errorMessage: undefined,
    };
  }

  if (action.type === "redo") {
    const nextHistory = redoHistory(state.history);
    if (nextHistory === state.history) {
      return state;
    }

    return {
      ...state,
      history: nextHistory,
      selectedTileId: getValidSelectedTileId(
        nextHistory.present,
        state.selectedTileId,
      ),
      dirty: true,
      errorMessage: undefined,
    };
  }

  if (action.type === "saveSucceeded") {
    return {
      ...state,
      dirty: false,
      lastSavedAt: action.savedAt,
      errorMessage: undefined,
    };
  }

  if (action.type === "setError") {
    return {
      ...state,
      errorMessage: action.errorMessage,
    };
  }

  return {
    ...state,
    errorMessage: undefined,
  };
}

export function MapEditorView() {
  const initialEditorState = useMemo(() => createInitialEditorState(), []);
  const [editorState, dispatch] = useReducer(
    editorViewReducer,
    initialEditorState,
    createEditorViewState,
  );
  const map = editorState.history.present;
  const [brushMode, setBrushMode] = useState<BrushMode>("terrain");
  const [terrainBrush, setTerrainBrush] = useState<Terrain>("plain");
  const [featureBrush, setFeatureBrush] = useState<FeatureType>("none");
  const [roadBrush, setRoadBrush] = useState<RoadLevel>("none");
  const [exportJson, setExportJson] = useState(() =>
    serializeMapDefinition(initialEditorState.map),
  );
  const [importJson, setImportJson] = useState("");
  const isPaintingRef = useRef(false);
  const paintedTileIdsRef = useRef(new Set<string>());
  const dragStartMapRef = useRef<MapDefinition | null>(null);
  const pointerCaptureRef = useRef<{
    element: HTMLElement;
    pointerId: number;
  } | null>(null);

  const tilesById = useMemo(
    () =>
      new Map(
        map.tiles.map((tile) => [tileDefinitionId(tile), tile] as const),
      ),
    [map.tiles],
  );
  const selectedTile = tilesById.get(editorState.selectedTileId);
  const mapWidth =
    MAP_PADDING * 2 + HEX_WIDTH * map.width + (map.height > 1 ? ODD_ROW_OFFSET : 0);
  const mapHeight =
    MAP_PADDING * 2 + HEX_VERTICAL_STEP * (map.height - 1) + HEX_HEIGHT;
  const saveStatusLabel =
    editorState.dirty || !editorState.lastSavedAt
      ? "未保存"
      : `已保存 ${editorState.lastSavedAt}`;

  const brush: BrushState = {
    mode: brushMode,
    terrain: terrainBrush,
    feature: featureBrush,
    roadLevel: roadBrush,
  };

  const handleSaveDraft = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      saveEditorDraftMap(map);
      dispatch({
        type: "saveSucceeded",
        savedAt: formatSavedTime(new Date()),
      });
    } catch (error) {
      dispatch({
        type: "setError",
        errorMessage:
          error instanceof Error
            ? error.message
            : "无法保存草稿到浏览器 localStorage。",
      });
    }
  }, [map]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!event.ctrlKey) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        handleSaveDraft();
      }

      if (key === "z") {
        event.preventDefault();
        dispatch({ type: "undo" });
      }

      if (key === "y") {
        event.preventDefault();
        dispatch({ type: "redo" });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveDraft]);

  useEffect(() => {
    if (!editorState.dirty) {
      return undefined;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [editorState.dirty]);

  function applyBrushOnceDuringDrag(tile: MapTileDefinition) {
    const tileId = tileDefinitionId(tile);
    if (paintedTileIdsRef.current.has(tileId)) {
      return;
    }

    paintedTileIdsRef.current.add(tileId);
    dispatch({
      type: "paintPresent",
      tile,
      brush,
    });
  }

  function finishPointerInteraction() {
    const wasPainting = isPaintingRef.current;
    const dragStartMap = dragStartMapRef.current;

    if (pointerCaptureRef.current) {
      const { element, pointerId } = pointerCaptureRef.current;
      if (element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId);
      }
    }

    pointerCaptureRef.current = null;
    isPaintingRef.current = false;
    dragStartMapRef.current = null;
    paintedTileIdsRef.current.clear();

    if (wasPainting && dragStartMap) {
      dispatch({
        type: "commitDrag",
        dragStartMap,
      });
    }
  }

  function handleTilePointerDown(
    event: PointerEvent<HTMLButtonElement>,
    tile: MapTileDefinition,
  ) {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerCaptureRef.current = {
      element: event.currentTarget,
      pointerId: event.pointerId,
    };
    isPaintingRef.current = true;
    dragStartMapRef.current = map;
    paintedTileIdsRef.current.clear();
    applyBrushOnceDuringDrag(tile);
  }

  function handleMapPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isPaintingRef.current) {
      return;
    }

    const tile = getTileFromPointer(event, tilesById);
    if (tile) {
      applyBrushOnceDuringDrag(tile);
    }
  }

  function handleExport() {
    setExportJson(serializeMapDefinition(map));
    dispatch({ type: "clearError" });
  }

  function handleImport() {
    try {
      const parsedMap = parseMapDefinition(importJson);
      dispatch({
        type: "pushMap",
        nextMap: parsedMap,
        selectedTileId: getStartingTileId(parsedMap),
      });
      setExportJson(serializeMapDefinition(parsedMap));
    } catch (error) {
      dispatch({
        type: "setError",
        errorMessage:
          error instanceof Error ? error.message : "无法导入地图 JSON。",
      });
    }
  }

  function handleSetStartingPosition() {
    if (!selectedTile) {
      return;
    }

    dispatch({
      type: "pushMap",
      nextMap: {
        ...map,
        startingPosition: { q: selectedTile.q, r: selectedTile.r },
      },
    });
  }

  function handleResetBlankMap() {
    const blankMap = createBlankMapDefinition();
    dispatch({
      type: "pushMap",
      nextMap: blankMap,
      selectedTileId: getStartingTileId(blankMap),
    });
    setExportJson(serializeMapDefinition(blankMap));
  }

  function handleResetTerrainRingMap() {
    const ringMap = createDefaultEditorMap();
    dispatch({
      type: "pushMap",
      nextMap: ringMap,
      selectedTileId: getStartingTileId(ringMap),
    });
    setExportJson(serializeMapDefinition(ringMap));
  }

  return (
    <main className="game-shell editor-shell">
      <header className="game-header editor-header">
        <div>
          <h1>地图绘制器</h1>
          <div className="resource-bar" aria-label="编辑器地图摘要">
            <span className="resource-pill">
              {map.width} x {map.height}
            </span>
            <span className="resource-pill">
              起始点 {map.startingPosition.q}, {map.startingPosition.r}
            </span>
            <span className="resource-pill">
              画笔 {BRUSH_MODE_LABELS[brushMode]}
            </span>
            <span className="resource-pill">{saveStatusLabel}</span>
          </div>
        </div>
      </header>

      <EditorToolbar
        brushMode={brushMode}
        featureBrush={featureBrush}
        roadBrush={roadBrush}
        terrainBrush={terrainBrush}
        onBrushModeChange={setBrushMode}
        onFeatureBrushChange={setFeatureBrush}
        onRoadBrushChange={setRoadBrush}
        onTerrainBrushChange={setTerrainBrush}
      />

      <div className="game-layout editor-layout">
        <div className="map-wrap editor-map-wrap">
          <div
            aria-label="地图绘制网格"
            className="grid-map editor-grid-map"
            onPointerCancel={finishPointerInteraction}
            onPointerLeave={finishPointerInteraction}
            onPointerMove={handleMapPointerMove}
            onPointerUp={finishPointerInteraction}
            role="grid"
            style={{ width: mapWidth, height: mapHeight }}
          >
            {map.tiles.map((tile) => {
              const tileId = tileDefinitionId(tile);
              const isSelected = tileId === editorState.selectedTileId;
              const isStart =
                tile.q === map.startingPosition.q &&
                tile.r === map.startingPosition.r;

              return (
                <button
                  aria-label={`${TERRAIN_LABELS[tile.terrain]}六边形 ${tile.q}, ${tile.r}`}
                  className={[
                    "map-tile",
                    "editor-map-tile",
                    `terrain-${tile.terrain}`,
                    isSelected ? "selected" : "",
                    isStart ? "editor-starting-position" : "",
                    tile.roadLevel !== "none"
                      ? `editor-road-${tile.roadLevel}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  data-tile-id={tileId}
                  key={tileId}
                  onPointerDown={(event) => handleTilePointerDown(event, tile)}
                  role="gridcell"
                  style={getHexPosition(tile)}
                  type="button"
                >
                  <span className="tile-terrain">
                    {TERRAIN_SHORT_LABELS[tile.terrain]}
                  </span>
                  <span className="tile-occupants" aria-hidden="true">
                    {isStart ? "起" : ""}
                    {tile.feature !== "none" ? "特" : ""}
                  </span>
                  <span className="tile-feature">
                    {tile.feature !== "none" ? FEATURE_LABELS[tile.feature] : ""}
                    {tile.roadLevel !== "none"
                      ? ` ${ROAD_LEVEL_LABELS[tile.roadLevel]}`
                      : ""}
                  </span>
                  <span className="tile-coords">
                    {tile.displayCol},{tile.displayRow}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <EditorSidePanel
          canRedo={canRedo(editorState.history)}
          canUndo={canUndo(editorState.history)}
          dirty={editorState.dirty}
          errorMessage={editorState.errorMessage}
          exportJson={exportJson}
          importJson={importJson}
          map={map}
          saveStatusLabel={saveStatusLabel}
          selectedTile={selectedTile}
          onExport={handleExport}
          onImport={handleImport}
          onImportJsonChange={setImportJson}
          onRedo={() => dispatch({ type: "redo" })}
          onResetBlankMap={handleResetBlankMap}
          onResetTerrainRingMap={handleResetTerrainRingMap}
          onSaveDraft={handleSaveDraft}
          onSetStartingPosition={handleSetStartingPosition}
          onUndo={() => dispatch({ type: "undo" })}
        />
      </div>
    </main>
  );
}
