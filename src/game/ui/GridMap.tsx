import type { GameState, Terrain, Tile } from "../core/types";

interface GridMapProps {
  state: GameState;
  selectedTileId: string | undefined;
  onTileClick: (tile: Tile) => void;
}

const TERRAIN_LABELS: Record<Terrain, string> = {
  grassland: "Gra",
  forest: "For",
  hill: "Hil",
  river: "Riv",
  coast: "Coa",
};

export function GridMap({ state, selectedTileId, onTileClick }: GridMapProps) {
  return (
    <div
      className="grid-map"
      role="grid"
      aria-label="World map"
      style={{
        gridTemplateColumns: `repeat(${state.width}, minmax(42px, 1fr))`,
      }}
    >
      {state.tiles.map((tile) => {
        const settler = state.player.settlers.find(
          (currentSettler) =>
            currentSettler.q === tile.q && currentSettler.r === tile.r,
        );
        const settlement = tile.settlementId
          ? state.player.settlements.find(
              (currentSettlement) =>
                currentSettlement.id === tile.settlementId,
            )
          : undefined;

        return (
          <button
            aria-label={`${tile.terrain} hex ${tile.q}, ${tile.r}`}
            className={[
              "map-tile",
              `terrain-${tile.terrain}`,
              selectedTileId === tile.id ? "selected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={tile.id}
            onClick={() => onTileClick(tile)}
            role="gridcell"
            type="button"
          >
            <span className="tile-terrain">{TERRAIN_LABELS[tile.terrain]}</span>
            <span className="tile-occupants" aria-hidden="true">
              {settler ? "S" : ""}
              {settlement ? "◎" : ""}
            </span>
            <span className="tile-coords">
              {tile.q},{tile.r}
            </span>
          </button>
        );
      })}
    </div>
  );
}
