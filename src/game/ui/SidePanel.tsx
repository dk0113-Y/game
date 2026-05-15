import { terrainRules } from "../data/terrainRules";
import type { Settlement, Settler, Tile } from "../core/types";

interface SidePanelProps {
  errorMessage: string | undefined;
  selectedTile: Tile | undefined;
  selectedSettler: Settler | undefined;
  selectedSettlement: Settlement | undefined;
  onFoundSettlement: () => void;
}

export function SidePanel({
  errorMessage,
  selectedTile,
  selectedSettler,
  selectedSettlement,
  onFoundSettlement,
}: SidePanelProps) {
  const terrainRule = selectedTile
    ? terrainRules[selectedTile.terrain]
    : undefined;

  return (
    <aside className="side-panel">
      <h2>Hex Info</h2>

      {errorMessage ? <div className="error-message">{errorMessage}</div> : null}

      {selectedTile ? (
        <>
          <dl className="detail-list">
            <div className="detail-row">
              <span>Axial Coord</span>
              <strong>
                {selectedTile.q}, {selectedTile.r}
              </strong>
            </div>
            <div className="detail-row">
              <span>Owner</span>
              <strong>{selectedTile.ownerId ?? "None"}</strong>
            </div>
            <div className="detail-row">
              <span>Terrain</span>
              <strong>{terrainRule?.label}</strong>
            </div>
            <div className="detail-row">
              <span>Move Cost</span>
              <strong>{terrainRule?.moveCost}</strong>
            </div>
            <div className="detail-row">
              <span>Potential</span>
              <strong>
                F{terrainRule?.potential.food} W{terrainRule?.potential.wood} S
                {terrainRule?.potential.stone} K
                {terrainRule?.potential.knowledge}
              </strong>
            </div>
            <div className="detail-row">
              <span>Can Found</span>
              <strong>{terrainRule?.canFoundSettlement ? "Yes" : "No"}</strong>
            </div>
            <div className="detail-row">
              <span>Settler</span>
              <strong>
                {selectedSettler
                  ? `S (${selectedSettler.movesLeft} moves)`
                  : "None"}
              </strong>
            </div>
            <div className="detail-row">
              <span>Settlement</span>
              <strong>
                {selectedSettlement
                  ? `${selectedSettlement.name} (${selectedSettlement.population})`
                  : "None"}
              </strong>
            </div>
          </dl>

          {selectedSettler ? (
            <button
              className="found-button"
              type="button"
              onClick={onFoundSettlement}
            >
              Found Settlement
            </button>
          ) : null}
        </>
      ) : (
        <p className="empty-selection">Select a hex on the map.</p>
      )}
    </aside>
  );
}
