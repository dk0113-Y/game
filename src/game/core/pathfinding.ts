import {
  TILE_DISTANCE_KM,
  travelProfiles,
  type TravelProfileId,
} from "../data/travelProfiles";
import { getHexNeighbors, hexDistance, hexToId } from "./hex";
import { getTileAt } from "./selectors";
import type { GameState, HexCoord, Tile, TravelTask } from "./types";

function coordKey(coord: HexCoord): string {
  return hexToId(coord.q, coord.r);
}

function getProfile(profileId: TravelProfileId) {
  const profile = travelProfiles[profileId];
  if (!profile) {
    throw new Error(`Unknown travel profile: ${profileId}`);
  }

  return profile;
}

export function getTileTravelCostDays(
  tile: Tile,
  profileId: TravelProfileId,
): number {
  const profile = getProfile(profileId);
  const terrainMultiplier = profile.terrainCostMultiplier[tile.terrain];

  return (TILE_DISTANCE_KM / profile.baseKmPerDay) * terrainMultiplier;
}

function estimateCostDays(
  from: HexCoord,
  to: HexCoord,
  profileId: TravelProfileId,
): number {
  const profile = getProfile(profileId);

  return hexDistance(from, to) * (TILE_DISTANCE_KM / profile.baseKmPerDay);
}

function reconstructPath(
  cameFrom: Map<string, HexCoord>,
  current: HexCoord,
): HexCoord[] {
  const path = [current];
  let currentKey = coordKey(current);

  while (cameFrom.has(currentKey)) {
    const previous = cameFrom.get(currentKey);
    if (!previous) {
      break;
    }

    path.unshift(previous);
    currentKey = coordKey(previous);
  }

  return path;
}

export function findPath(
  state: GameState,
  start: HexCoord,
  goal: HexCoord,
  profileId: TravelProfileId,
): HexCoord[] {
  if (!getTileAt(state, start.q, start.r)) {
    throw new Error("Start tile is outside the map.");
  }

  if (!getTileAt(state, goal.q, goal.r)) {
    throw new Error("Goal tile is outside the map.");
  }

  if (start.q === goal.q && start.r === goal.r) {
    return [start];
  }

  const openSet = new Set<string>([coordKey(start)]);
  const coordsByKey = new Map<string, HexCoord>([[coordKey(start), start]]);
  const cameFrom = new Map<string, HexCoord>();
  const gScore = new Map<string, number>([[coordKey(start), 0]]);
  const fScore = new Map<string, number>([
    [coordKey(start), estimateCostDays(start, goal, profileId)],
  ]);

  while (openSet.size > 0) {
    let currentKey = "";
    let currentScore = Number.POSITIVE_INFINITY;

    for (const candidateKey of openSet) {
      const candidateScore =
        fScore.get(candidateKey) ?? Number.POSITIVE_INFINITY;
      if (candidateScore < currentScore) {
        currentKey = candidateKey;
        currentScore = candidateScore;
      }
    }

    const current = coordsByKey.get(currentKey);
    if (!current) {
      break;
    }

    if (current.q === goal.q && current.r === goal.r) {
      return reconstructPath(cameFrom, current);
    }

    openSet.delete(currentKey);

    for (const neighbor of getHexNeighbors(current)) {
      const neighborTile = getTileAt(state, neighbor.q, neighbor.r);
      if (!neighborTile) {
        continue;
      }

      const neighborKey = coordKey(neighbor);
      const tentativeGScore =
        (gScore.get(currentKey) ?? Number.POSITIVE_INFINITY) +
        getTileTravelCostDays(neighborTile, profileId);

      if (
        tentativeGScore <
        (gScore.get(neighborKey) ?? Number.POSITIVE_INFINITY)
      ) {
        cameFrom.set(neighborKey, current);
        coordsByKey.set(neighborKey, neighbor);
        gScore.set(neighborKey, tentativeGScore);
        fScore.set(
          neighborKey,
          tentativeGScore + estimateCostDays(neighbor, goal, profileId),
        );
        openSet.add(neighborKey);
      }
    }
  }

  throw new Error("No path found.");
}

export function getPathTravelCostDays(
  state: GameState,
  path: HexCoord[],
  profileId: TravelProfileId,
): number {
  return path.slice(1).reduce((totalCost, coord) => {
    const tile = getTileAt(state, coord.q, coord.r);
    if (!tile) {
      throw new Error("Path contains a tile outside the map.");
    }

    return totalCost + getTileTravelCostDays(tile, profileId);
  }, 0);
}

export function getTravelTaskRemainingDays(
  state: GameState,
  task: TravelTask,
): number {
  const remainingPath = task.path.slice(task.currentSegmentIndex + 1);
  const remainingCost = getPathTravelCostDays(
    state,
    [task.path[task.currentSegmentIndex], ...remainingPath],
    task.profileId,
  );

  return Math.max(0, remainingCost - task.progressOnSegmentDays);
}
