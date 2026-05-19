import type { GameSpeed, GameState, GameTime } from "./types";
import { getTileTravelCostDays } from "./pathfinding";
import { getTileAt } from "./selectors";
import type { Settler, TravelTask } from "./types";

const DAYS_PER_MONTH = 30;
const MONTHS_PER_YEAR = 12;
const DAYS_PER_YEAR = DAYS_PER_MONTH * MONTHS_PER_YEAR;
const VALID_SPEEDS: GameSpeed[] = [0, 1, 2, 3, 4, 5];

function dateFromAbsoluteDay(day: number): Pick<
  GameTime,
  "year" | "month" | "dayOfMonth"
> {
  const zeroBasedDay = day - 1;

  return {
    year: Math.floor(zeroBasedDay / DAYS_PER_YEAR) + 1,
    month: Math.floor((zeroBasedDay % DAYS_PER_YEAR) / DAYS_PER_MONTH) + 1,
    dayOfMonth: (zeroBasedDay % DAYS_PER_MONTH) + 1,
  };
}

export function createInitialTime(): GameTime {
  return {
    day: 1,
    year: 1,
    month: 1,
    dayOfMonth: 1,
    speed: 1,
    paused: false,
  };
}

function advanceTravelTaskOneDay(
  state: GameState,
  settler: Settler,
  task: TravelTask,
): Settler {
  let currentSegmentIndex = task.currentSegmentIndex;
  let progressOnSegmentDays = task.progressOnSegmentDays + 1;
  let q = settler.q;
  let r = settler.r;

  while (currentSegmentIndex < task.path.length - 1) {
    const nextCoord = task.path[currentSegmentIndex + 1];
    const nextTile = getTileAt(state, nextCoord.q, nextCoord.r);
    if (!nextTile) {
      throw new Error("Travel path contains a tile outside the map.");
    }

    const segmentCost = getTileTravelCostDays(nextTile, task.profileId);
    if (progressOnSegmentDays < segmentCost) {
      break;
    }

    progressOnSegmentDays -= segmentCost;
    q = nextCoord.q;
    r = nextCoord.r;
    currentSegmentIndex += 1;
  }

  if (currentSegmentIndex >= task.path.length - 1) {
    return {
      ...settler,
      q,
      r,
      movesLeft: 2,
      currentTask: undefined,
    };
  }

  return {
    ...settler,
    q,
    r,
    movesLeft: 2,
    currentTask: {
      ...task,
      currentSegmentIndex,
      progressOnSegmentDays,
    },
  };
}

export function advanceOneDay(state: GameState): GameState {
  const settlementCount = state.player.settlements.length;
  const nextDay = state.time.day + 1;

  return {
    ...state,
    turn: state.turn + 1,
    time: {
      ...state.time,
      day: nextDay,
      ...dateFromAbsoluteDay(nextDay),
    },
    player: {
      ...state.player,
      food: state.player.food + settlementCount,
      knowledge: state.player.knowledge + settlementCount,
      settlers: state.player.settlers.map((settler) =>
        settler.currentTask?.type === "travel"
          ? advanceTravelTaskOneDay(state, settler, settler.currentTask)
          : {
              ...settler,
              movesLeft: 2,
            },
      ),
    },
  };
}

export function advanceDays(state: GameState, days: number): GameState {
  if (!Number.isInteger(days) || days < 0) {
    throw new Error("Days must be a non-negative integer.");
  }

  let nextState = state;

  for (let currentDay = 0; currentDay < days; currentDay += 1) {
    nextState = advanceOneDay(nextState);
  }

  return nextState;
}

export function setSpeed(state: GameState, speed: GameSpeed): GameState {
  if (!VALID_SPEEDS.includes(speed)) {
    throw new Error("Invalid game speed.");
  }

  return {
    ...state,
    time: {
      ...state.time,
      speed,
    },
  };
}

export function togglePause(state: GameState): GameState {
  return {
    ...state,
    time: {
      ...state.time,
      paused: !state.time.paused,
    },
  };
}

export function isMonthStart(time: GameTime): boolean {
  return time.dayOfMonth === 1;
}

export function isSeasonStart(time: GameTime): boolean {
  return isMonthStart(time) && [1, 4, 7, 10].includes(time.month);
}

export function isYearStart(time: GameTime): boolean {
  return isMonthStart(time) && time.month === 1;
}
