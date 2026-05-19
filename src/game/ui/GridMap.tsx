import type { CSSProperties } from "react";
import type { GameState, Tile } from "../core/types";
import { TERRAIN_LABELS, TERRAIN_SHORT_LABELS } from "../data/labels";

interface GridMapProps {
  state: GameState;
  selectedTileId: string | undefined;
  travelPath: TileCoord[];
  onTileClick: (tile: Tile) => void;
}

type TileCoord = Pick<Tile, "q" | "r">;

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

function coordKey(coord: TileCoord): string {
  return `${coord.q},${coord.r}`;
}

export function GridMap({
  state,
  selectedTileId,
  travelPath,
  onTileClick,
}: GridMapProps) {
  const mapWidth =
    MAP_PADDING * 2 + HEX_WIDTH * (state.width + (state.height - 1) / 2);
  const mapHeight =
    MAP_PADDING * 2 + HEX_VERTICAL_STEP * (state.height - 1) + HEX_HEIGHT;
  const travelPathKeys = new Set(travelPath.map(coordKey));
  const travelDestinationKey =
    travelPath.length > 0 ? coordKey(travelPath[travelPath.length - 1]) : "";

  return (
    <div
      className="grid-map"
      role="grid"
      aria-label="世界地图"
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
            aria-label={`${TERRAIN_LABELS[tile.terrain]}六边形 ${tile.q}, ${tile.r}`}
            className={[
              "map-tile",
              `terrain-${tile.terrain}`,
              selectedTileId === tile.id ? "selected" : "",
              travelPathKeys.has(coordKey(tile)) ? "travel-path" : "",
              travelDestinationKey === coordKey(tile)
                ? "travel-destination"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={tile.id}
            onClick={() => onTileClick(tile)}
            role="gridcell"
            style={getHexPosition(tile)}
            type="button"
          >
            <span className="tile-terrain">
              {TERRAIN_SHORT_LABELS[tile.terrain]}
            </span>
            <span className="tile-occupants" aria-hidden="true">
              {settler ? "拓" : ""}
              {settlement ? "营" : ""}
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
