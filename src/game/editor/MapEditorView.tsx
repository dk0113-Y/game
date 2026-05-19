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

export function MapEditorView() {
  const [map, setMap] = useState(createDefaultEditorMap);
  const [selectedTileId, setSelectedTileId] = useState(() => {
    const start = createDefaultEditorMap().startingPosition;
    return hexToId(start.q, start.r);
  });
  const [brushMode, setBrushMode] = useState<BrushMode>("terrain");
  const [terrainBrush, setTerrainBrush] = useState<Terrain>("plain");
  const [featureBrush, setFeatureBrush] = useState<FeatureType>("none");
  const [roadBrush, setRoadBrush] = useState<RoadLevel>("none");
  const [exportJson, setExportJson] = useState(() =>
    serializeMapDefinition(createDefaultEditorMap()),
  );
  const [importJson, setImportJson] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const isPaintingRef = useRef(false);
  const paintedTileIdsRef = useRef(new Set<string>());
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
  const selectedTile = tilesById.get(selectedTileId);
  const mapWidth =
    MAP_PADDING * 2 + HEX_WIDTH * map.width + (map.height > 1 ? ODD_ROW_OFFSET : 0);
  const mapHeight =
    MAP_PADDING * 2 + HEX_VERTICAL_STEP * (map.height - 1) + HEX_HEIGHT;

  const brush: BrushState = {
    mode: brushMode,
    terrain: terrainBrush,
    feature: featureBrush,
    roadLevel: roadBrush,
  };

  function applyBrush(tile: MapTileDefinition) {
    setSelectedTileId(tileDefinitionId(tile));
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

  function finishPointerInteraction() {
    if (pointerCaptureRef.current) {
      const { element, pointerId } = pointerCaptureRef.current;
      if (element.hasPointerCapture(pointerId)) {
        element.releasePointerCapture(pointerId);
      }
    }

    pointerCaptureRef.current = null;
    isPaintingRef.current = false;
    paintedTileIdsRef.current.clear();
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
    setErrorMessage(undefined);
  }

  function handleImport() {
    try {
      const parsedMap = parseMapDefinition(importJson);
      setMap(parsedMap);
      setSelectedTileId(
        hexToId(parsedMap.startingPosition.q, parsedMap.startingPosition.r),
      );
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

  function handleResetBlankMap() {
    const blankMap = createBlankMapDefinition();
    setMap(blankMap);
    setSelectedTileId(hexToId(blankMap.startingPosition.q, blankMap.startingPosition.r));
    setExportJson(serializeMapDefinition(blankMap));
    setErrorMessage(undefined);
  }

  function handleResetTerrainRingMap() {
    const ringMap = createDefaultEditorMap();
    setMap(ringMap);
    setSelectedTileId(hexToId(ringMap.startingPosition.q, ringMap.startingPosition.r));
    setExportJson(serializeMapDefinition(ringMap));
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
              const isSelected = tileId === selectedTileId;
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
          errorMessage={errorMessage}
          exportJson={exportJson}
          importJson={importJson}
          map={map}
          selectedTile={selectedTile}
          onExport={handleExport}
          onImport={handleImport}
          onImportJsonChange={setImportJson}
          onResetBlankMap={handleResetBlankMap}
          onResetTerrainRingMap={handleResetTerrainRingMap}
          onSetStartingPosition={handleSetStartingPosition}
        />
      </div>
    </main>
  );
}
