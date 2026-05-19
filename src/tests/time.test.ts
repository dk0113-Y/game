import { describe, expect, it } from "vitest";
import { foundSettlement } from "../game/core/actions";
import { createInitialWorld } from "../game/core/createWorld";
import {
  advanceDays,
  advanceOneDay,
  createInitialTime,
  isMonthStart,
  isSeasonStart,
  isYearStart,
  togglePause,
} from "../game/core/time";

describe("game time", () => {
  it("creates the initial date and speed state", () => {
    expect(createInitialTime()).toEqual({
      day: 1,
      year: 1,
      month: 1,
      dayOfMonth: 1,
      speed: 1,
      paused: false,
    });
  });

  it("advances one day", () => {
    const state = createInitialWorld(5, 5);
    const nextState = advanceOneDay(state);

    expect(nextState.time).toMatchObject({
      day: 2,
      year: 1,
      month: 1,
      dayOfMonth: 2,
    });
    expect(nextState.turn).toBe(2);
  });

  it("enters the next month after 30 elapsed days", () => {
    const state = createInitialWorld(5, 5);
    const nextState = advanceDays(state, 30);

    expect(nextState.time).toMatchObject({
      day: 31,
      year: 1,
      month: 2,
      dayOfMonth: 1,
    });
    expect(isMonthStart(nextState.time)).toBe(true);
  });

  it("enters the next year after 360 elapsed days", () => {
    const state = createInitialWorld(5, 5);
    const nextState = advanceDays(state, 360);

    expect(nextState.time).toMatchObject({
      day: 361,
      year: 2,
      month: 1,
      dayOfMonth: 1,
    });
    expect(isSeasonStart(nextState.time)).toBe(true);
    expect(isYearStart(nextState.time)).toBe(true);
  });

  it("does not auto advance in core when paused is toggled", () => {
    const state = createInitialWorld(5, 5);
    const pausedState = togglePause(state);

    expect(pausedState.time.paused).toBe(true);
    expect(pausedState.time.day).toBe(state.time.day);
    expect(pausedState.turn).toBe(state.turn);
  });

  it("keeps settlement activity output on daily advance", () => {
    const state = foundSettlement(
      createInitialWorld(5, 5),
      "settler-1",
      "First Home",
    );
    const nextState = advanceOneDay(state);

    expect(nextState.player.food).toBe(1);
    expect(nextState.player.wood).toBe(0);
    expect(nextState.player.stone).toBe(0);
    expect(nextState.player.knowledge).toBe(1);
  });
});
