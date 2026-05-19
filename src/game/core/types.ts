export type Terrain = "grassland" | "forest" | "hill" | "river" | "coast";

export interface HexCoord {
  q: number;
  r: number;
}

export interface ResourceYield {
  food: number;
  wood: number;
  stone: number;
  knowledge: number;
}

export interface TerrainRule {
  label: string;
  potential: ResourceYield;
  moveCost: number;
  canFoundSettlement: boolean;
}

export type ImprovementType = "farm" | "lumberCamp" | "quarry" | "study";

export interface ImprovementRule {
  label: string;
  allowedTerrains: Terrain[];
  yield: ResourceYield;
}

export interface Tile extends HexCoord {
  id: string;
  terrain: Terrain;
  ownerId?: string;
  settlementId?: string;
}

export interface TravelTask {
  type: "travel";
  path: HexCoord[];
  currentSegmentIndex: number;
  progressOnSegmentDays: number;
  profileId: "walking";
}

export interface Settler extends HexCoord {
  id: string;
  movesLeft: number;
  currentTask?: TravelTask;
}

export interface Settlement extends HexCoord {
  id: string;
  name: string;
  population: number;
}

export interface PlayerState {
  id: string;
  food: number;
  wood: number;
  stone: number;
  knowledge: number;
  settlers: Settler[];
  settlements: Settlement[];
}

export type GameSpeed = 0 | 1 | 2 | 3 | 4 | 5;

export interface GameTime {
  day: number;
  year: number;
  month: number;
  dayOfMonth: number;
  speed: GameSpeed;
  paused: boolean;
}

export interface GameState {
  width: number;
  height: number;
  turn: number;
  time: GameTime;
  tiles: Tile[];
  player: PlayerState;
}
