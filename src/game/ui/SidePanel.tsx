import type { Settlement, Settler, Tile } from "../core/types";
import { TERRAIN_LABELS } from "../data/labels";
import { terrainRules } from "../data/terrainRules";

interface SidePanelProps {
  errorMessage: string | undefined;
  selectedTile: Tile | undefined;
  selectedSettler: Settler | undefined;
  selectedSettlement: Settlement | undefined;
  travelRemainingDays: number | undefined;
  onFoundSettlement: () => void;
}

export function SidePanel({
  errorMessage,
  selectedTile,
  selectedSettler,
  selectedSettlement,
  travelRemainingDays,
  onFoundSettlement,
}: SidePanelProps) {
  const terrainRule = selectedTile
    ? terrainRules[selectedTile.terrain]
    : undefined;

  return (
    <aside className="side-panel">
      <h2>地块信息</h2>

      {errorMessage ? <div className="error-message">{errorMessage}</div> : null}

      {selectedTile ? (
        <>
          <dl className="detail-list">
            <div className="detail-row">
              <span>轴向坐标</span>
              <strong>
                {selectedTile.q}, {selectedTile.r}
              </strong>
            </div>
            <div className="detail-row">
              <span>归属</span>
              <strong>{selectedTile.ownerId ?? "无"}</strong>
            </div>
            <div className="detail-row">
              <span>地形</span>
              <strong>{TERRAIN_LABELS[selectedTile.terrain]}</strong>
            </div>
            <div className="detail-row">
              <span>移动成本</span>
              <strong>{terrainRule?.moveCost}</strong>
            </div>
            <div className="detail-row">
              <span>潜力</span>
              <strong>
                食{terrainRule?.potential.food} 木{terrainRule?.potential.wood}
                石{terrainRule?.potential.stone} 知
                {terrainRule?.potential.knowledge}
              </strong>
            </div>
            <div className="detail-row">
              <span>可扎营</span>
              <strong>{terrainRule?.canFoundSettlement ? "是" : "否"}</strong>
            </div>
            <div className="detail-row">
              <span>开拓者</span>
              <strong>
                {selectedSettler
                  ? `拓（${selectedSettler.movesLeft} 移动点）`
                  : "无"}
              </strong>
            </div>
            <div className="detail-row">
              <span>旅行</span>
              <strong>
                {selectedSettler?.currentTask
                  ? `旅行中（剩余约 ${travelRemainingDays ?? 0} 天）`
                  : "空闲"}
              </strong>
            </div>
            <div className="detail-row">
              <span>营地</span>
              <strong>
                {selectedSettlement
                  ? `${selectedSettlement.name}（人口 ${selectedSettlement.population}）`
                  : "无"}
              </strong>
            </div>
          </dl>

          {selectedSettler && !selectedSettler.currentTask ? (
            <button
              className="found-button"
              type="button"
              onClick={onFoundSettlement}
            >
              建立营地
            </button>
          ) : null}
        </>
      ) : (
        <p className="empty-selection">请选择地图上的六边形地块。</p>
      )}
    </aside>
  );
}
