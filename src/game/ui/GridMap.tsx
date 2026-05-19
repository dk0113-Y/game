import type { CSSProperties } from "react";
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

const HEX_WIDTH = 72;
const HEX_HEIGHT = 64;
const HEX_VERTICAL_STEP = HEX_HEIGHT * 0.75;
const MAP_PADDING = 12;

function getHexPosition(tile: Tile): CSSProperties {
  return {
    left: MAP_PADDING + HEX_WIDTH * (tile.q + tile.r / 2),
    top: MAP_PADDING + HEX_VERTICAL_STEP * tile.r,
    width: HEX_WIDTH,
    height: HEX_HEIGHT,
  };
}

export function GridMap({ state, selectedTileId, onTileClick }: GridMapProps) {
  const mapWidth =
    MAP_PADDING * 2 + HEX_WIDTH * (state.width + (state.height - 1) / 2);
  const mapHeight =
    MAP_PADDING * 2 + HEX_VERTICAL_STEP * (state.height - 1) + HEX_HEIGHT;

  return (
    <div
      className="grid-map"
      role="grid"
      aria-label="World map"
      style={{
        width: mapWidth,
        height: mapHeight,
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
            style={getHexPosition(tile)}
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
