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
  selectedTileCount: number;
  selectedTile: MapTileDefinition | undefined;
  canBatchApply: boolean;
  onApplyBrushToSelection: () => void;
  onClearSelection: () => void;
  onExport: () => void;
  onImport: () => void;
  onImportJsonChange: (json: string) => void;
  onSetStartingPosition: () => void;
}

export function EditorSidePanel({
  errorMessage,
  exportJson,
  importJson,
  map,
  selectedTileCount,
  selectedTile,
  canBatchApply,
  onApplyBrushToSelection,
  onClearSelection,
  onExport,
  onImport,
  onImportJsonChange,
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

      <div className="editor-selection-tools">
        <div className="detail-row">
          <span>多选数量</span>
          <strong>{selectedTileCount}</strong>
        </div>
        <button
          className="editor-primary-button"
          disabled={!canBatchApply}
          onClick={onApplyBrushToSelection}
          type="button"
        >
          应用当前画笔到选中格
        </button>
        <button
          className="editor-primary-button secondary"
          disabled={selectedTileCount === 0}
          onClick={onClearSelection}
          type="button"
        >
          清空选择
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
