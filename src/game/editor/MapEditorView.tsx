import {
  useMemo,
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
  MapTileDefinition,
  RoadLevel,
} from "../data/maps/mapTypes";
import { EditorSidePanel } from "./EditorSidePanel";
import { EditorToolbar } from "./EditorToolbar";
import {
  addSelectedTile,
  applyBrushToTile,
  applyBrushToTiles,
  tileDefinitionId,
  toggleSelectedTile,
} from "./editorMapActions";
import type { BrushMode, BrushState } from "./editorTypes";
import {
  createBlankMapDefinition,
  parseMapDefinition,
  serializeMapDefinition,
} from "./mapSerialization";

const HEX_WIDTH = 72;
const HEX_HEIGHT = 64;
const HEX_VERTICAL_STEP = HEX_HEIGHT * 0.75;
const MAP_PADDING = 12;

function getHexPosition(tile: MapTileDefinition): CSSProperties {
  return {
    left: MAP_PADDING + HEX_WIDTH * (tile.q + tile.r / 2),
    top: MAP_PADDING + HEX_VERTICAL_STEP * tile.r,
    width: HEX_WIDTH,
    height: HEX_HEIGHT,
  };
}

export function MapEditorView() {
  const [map, setMap] = useState(() => createBlankMapDefinition(10, 10));
  const [selectedTileId, setSelectedTileId] = useState(() => hexToId(5, 5));
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([]);
  const [brushMode, setBrushMode] = useState<BrushMode>("terrain");
  const [terrainBrush, setTerrainBrush] = useState<Terrain>("grassland");
  const [featureBrush, setFeatureBrush] = useState<FeatureType>("none");
  const [roadBrush, setRoadBrush] = useState<RoadLevel>("none");
  const [exportJson, setExportJson] = useState(() =>
    serializeMapDefinition(createBlankMapDefinition(10, 10)),
  );
  const [importJson, setImportJson] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const isPaintingRef = useRef(false);
  const isSelectingRef = useRef(false);
  const paintedTileIdsRef = useRef(new Set<string>());
  const selectionDragTileIdsRef = useRef(new Set<string>());

  const selectedTile = useMemo(
    () =>
      map.tiles.find((tile) => hexToId(tile.q, tile.r) === selectedTileId),
    [map.tiles, selectedTileId],
  );
  const mapWidth =
    MAP_PADDING * 2 + HEX_WIDTH * (map.width + (map.height - 1) / 2);
  const mapHeight =
    MAP_PADDING * 2 + HEX_VERTICAL_STEP * (map.height - 1) + HEX_HEIGHT;

  const brush: BrushState = {
    mode: brushMode,
    terrain: terrainBrush,
    feature: featureBrush,
    roadLevel: roadBrush,
  };
  const canBatchApply = selectedTileIds.length > 0 && brushMode !== "startingPosition";

  function applyBrush(tile: MapTileDefinition) {
    setSelectedTileId(hexToId(tile.q, tile.r));
    setErrorMessage(undefined);
    setMap((currentMap) => applyBrushToTile(currentMap, tile, brush));
  }

  function applyBrushOnceDuringDrag(tile: MapTileDefinition) {
    const tileId = tileDefinitionId(tile);
    if (paintedTileIdsRef.current.has(tileId)) {
      return;
    }

    paintedTileIdsRef.current.add(tileId);
    applyBrush(tile);
  }

  function addSelectionOnceDuringDrag(tile: MapTileDefinition) {
    const tileId = tileDefinitionId(tile);
    if (selectionDragTileIdsRef.current.has(tileId)) {
      return;
    }

    selectionDragTileIdsRef.current.add(tileId);
    setSelectedTileId(tileId);
    setSelectedTileIds((currentSelectedTileIds) =>
      addSelectedTile(currentSelectedTileIds, tileId),
    );
  }

  function finishPointerInteraction() {
    isPaintingRef.current = false;
    isSelectingRef.current = false;
    paintedTileIdsRef.current.clear();
    selectionDragTileIdsRef.current.clear();
  }

  function handleTilePointerDown(
    event: PointerEvent<HTMLButtonElement>,
    tile: MapTileDefinition,
  ) {
    event.preventDefault();
    const tileId = tileDefinitionId(tile);

    if (event.button === 0) {
      isPaintingRef.current = true;
      isSelectingRef.current = false;
      paintedTileIdsRef.current.clear();
      applyBrushOnceDuringDrag(tile);
      return;
    }

    if (event.button === 2) {
      isSelectingRef.current = true;
      isPaintingRef.current = false;
      selectionDragTileIdsRef.current.clear();
      selectionDragTileIdsRef.current.add(tileId);
      setSelectedTileId(tileId);
      setSelectedTileIds((currentSelectedTileIds) =>
        toggleSelectedTile(currentSelectedTileIds, tileId),
      );
    }
  }

  function handleTilePointerOver(tile: MapTileDefinition) {
    if (isPaintingRef.current) {
      applyBrushOnceDuringDrag(tile);
      return;
    }

    if (isSelectingRef.current) {
      addSelectionOnceDuringDrag(tile);
    }
  }

  function handleExport() {
    setExportJson(serializeMapDefinition(map));
    setErrorMessage(undefined);
  }

  function handleImport() {
    try {
      const parsedMap = parseMapDefinition(importJson);
      setMap(parsedMap);
      setSelectedTileId(
        hexToId(parsedMap.startingPosition.q, parsedMap.startingPosition.r),
      );
      setSelectedTileIds([]);
      setExportJson(serializeMapDefinition(parsedMap));
      setErrorMessage(undefined);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "无法导入地图 JSON。");
    }
  }

  function handleSetStartingPosition() {
    if (!selectedTile) {
      return;
    }

    setMap((currentMap) => ({
      ...currentMap,
      startingPosition: { q: selectedTile.q, r: selectedTile.r },
    }));
    setErrorMessage(undefined);
  }

  function handleApplyBrushToSelection() {
    if (brushMode === "startingPosition" || selectedTileIds.length === 0) {
      return;
    }

    setMap((currentMap) =>
      applyBrushToTiles(currentMap, selectedTileIds, brush),
    );
    setErrorMessage(undefined);
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
        <div className="map-wrap">
          <div
            aria-label="地图绘制网格"
            className="grid-map"
            onContextMenu={(event) => event.preventDefault()}
            onPointerCancel={finishPointerInteraction}
            onPointerLeave={finishPointerInteraction}
            onPointerUp={finishPointerInteraction}
            role="grid"
            style={{ width: mapWidth, height: mapHeight }}
          >
            {map.tiles.map((tile) => {
              const tileId = hexToId(tile.q, tile.r);
              const isSelected = tileId === selectedTileId;
              const isStart =
                tile.q === map.startingPosition.q &&
                tile.r === map.startingPosition.r;
              const isBatchSelected = selectedTileIds.includes(tileId);

              return (
                <button
                  aria-label={`${TERRAIN_LABELS[tile.terrain]}六边形 ${tile.q}, ${tile.r}`}
                  className={[
                    "map-tile",
                    "editor-map-tile",
                    `terrain-${tile.terrain}`,
                    isSelected ? "selected" : "",
                    isBatchSelected ? "selected-for-batch" : "",
                    isStart ? "editor-starting-position" : "",
                    tile.roadLevel !== "none"
                      ? `editor-road-${tile.roadLevel}`
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={tileId}
                  onContextMenu={(event) => event.preventDefault()}
                  onPointerDown={(event) => handleTilePointerDown(event, tile)}
                  onPointerEnter={() => handleTilePointerOver(tile)}
                  onPointerMove={() => handleTilePointerOver(tile)}
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
                    {tile.q},{tile.r}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <EditorSidePanel
          errorMessage={errorMessage}
          exportJson={exportJson}
          importJson={importJson}
          map={map}
          selectedTileCount={selectedTileIds.length}
          selectedTile={selectedTile}
          canBatchApply={canBatchApply}
          onApplyBrushToSelection={handleApplyBrushToSelection}
          onClearSelection={() => setSelectedTileIds([])}
          onExport={handleExport}
          onImport={handleImport}
          onImportJsonChange={setImportJson}
          onSetStartingPosition={handleSetStartingPosition}
        />
      </div>
    </main>
  );
}
