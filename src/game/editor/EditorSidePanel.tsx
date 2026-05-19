import {
  FEATURE_LABELS,
  ROAD_LEVEL_LABELS,
  TERRAIN_LABELS,
} from "../data/labels";
import type { MapDefinition, MapTileDefinition } from "../data/maps/mapTypes";

interface EditorSidePanelProps {
  errorMessage: string | undefined;
  exportJson: string;
  importJson: string;
  map: MapDefinition;
  selectedTile: MapTileDefinition | undefined;
  onExport: () => void;
  onImport: () => void;
  onImportJsonChange: (json: string) => void;
  onResetBlankMap: () => void;
  onResetTerrainRingMap: () => void;
  onSetStartingPosition: () => void;
}

export function EditorSidePanel({
  errorMessage,
  exportJson,
  importJson,
  map,
  selectedTile,
  onExport,
  onImport,
  onImportJsonChange,
  onResetBlankMap,
  onResetTerrainRingMap,
  onSetStartingPosition,
}: EditorSidePanelProps) {
  const selectedIsStart =
    selectedTile?.q === map.startingPosition.q &&
    selectedTile?.r === map.startingPosition.r;

  return (
    <aside className="side-panel editor-side-panel">
      <h2>地图绘制器</h2>

      {errorMessage ? <div className="error-message">{errorMessage}</div> : null}

      {selectedTile ? (
        <dl className="detail-list">
          <div className="detail-row">
            <span>轴向坐标</span>
            <strong>
              {selectedTile.q}, {selectedTile.r}
            </strong>
          </div>
          <div className="detail-row">
            <span>显示行列</span>
            <strong>
              {selectedTile.displayCol}, {selectedTile.displayRow}
            </strong>
          </div>
          <div className="detail-row">
            <span>地形</span>
            <strong>{TERRAIN_LABELS[selectedTile.terrain]}</strong>
          </div>
          <div className="detail-row">
            <span>特征</span>
            <strong>{FEATURE_LABELS[selectedTile.feature]}</strong>
          </div>
          <div className="detail-row">
            <span>道路</span>
            <strong>{ROAD_LEVEL_LABELS[selectedTile.roadLevel]}</strong>
          </div>
          <div className="detail-row">
            <span>起始点</span>
            <strong>{selectedIsStart ? "是" : "否"}</strong>
          </div>
        </dl>
      ) : (
        <p className="empty-selection">请选择一个六边形地块。</p>
      )}

      <button
        className="editor-primary-button"
        disabled={!selectedTile}
        onClick={onSetStartingPosition}
        type="button"
      >
        设为起始点
      </button>

      <div className="editor-map-actions">
        <button
          className="editor-primary-button secondary"
          onClick={onResetTerrainRingMap}
          type="button"
        >
          重置为地形环带模板
        </button>
        <button
          className="editor-primary-button secondary"
          onClick={onResetBlankMap}
          type="button"
        >
          重置为空白地图
        </button>
      </div>

      <div className="editor-json-section">
        <button
          className="editor-primary-button"
          onClick={onExport}
          type="button"
        >
          导出 JSON
        </button>
        <textarea
          aria-label="导出的地图 JSON"
          className="editor-json-textarea"
          readOnly
          value={exportJson}
        />
      </div>

      <div className="editor-json-section">
        <textarea
          aria-label="导入地图 JSON"
          className="editor-json-textarea"
          onChange={(event) => onImportJsonChange(event.target.value)}
          placeholder="在此粘贴地图定义 JSON"
          value={importJson}
        />
        <button
          className="editor-primary-button"
          onClick={onImport}
          type="button"
        >
          导入 JSON
        </button>
      </div>
    </aside>
  );
}
