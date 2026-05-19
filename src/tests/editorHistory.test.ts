import { describe, expect, it } from "vitest";
import {
  canRedo,
  canUndo,
  createEditorHistory,
  pushHistory,
  redoHistory,
  undoHistory,
} from "../game/editor/editorHistory";
import { createBlankMapDefinition } from "../game/editor/mapSerialization";

function mapWithStartAtFirstTile() {
  const map = createBlankMapDefinition(3, 3);
  const firstTile = map.tiles[0];

  return {
    ...map,
    startingPosition: { q: firstTile.q, r: firstTile.r },
  };
}

function mapWithStartAtLastTile() {
  const map = createBlankMapDefinition(3, 3);
  const lastTile = map.tiles[map.tiles.length - 1];

  return {
    ...map,
    startingPosition: { q: lastTile.q, r: lastTile.r },
  };
}

describe("editor history", () => {
  it("allows undo after pushing a new state", () => {
    const initialMap = createBlankMapDefinition(3, 3);
    const nextMap = mapWithStartAtFirstTile();
    const history = pushHistory(createEditorHistory(initialMap), nextMap);

    expect(canUndo(history)).toBe(true);
  });

  it("undo restores the previous state and enables redo", () => {
    const initialMap = createBlankMapDefinition(3, 3);
    const nextMap = mapWithStartAtFirstTile();
    const history = undoHistory(
      pushHistory(createEditorHistory(initialMap), nextMap),
    );

    expect(history.present).toEqual(initialMap);
    expect(canRedo(history)).toBe(true);
  });

  it("redo restores the next state", () => {
    const initialMap = createBlankMapDefinition(3, 3);
    const nextMap = mapWithStartAtFirstTile();
    const history = redoHistory(
      undoHistory(pushHistory(createEditorHistory(initialMap), nextMap)),
    );

    expect(history.present).toEqual(nextMap);
  });

  it("clears future when pushing a new state after undo", () => {
    const initialMap = createBlankMapDefinition(3, 3);
    const firstMap = mapWithStartAtFirstTile();
    const lastMap = mapWithStartAtLastTile();
    const undoneHistory = undoHistory(
      pushHistory(createEditorHistory(initialMap), firstMap),
    );
    const history = pushHistory(undoneHistory, lastMap);

    expect(history.present).toEqual(lastMap);
    expect(canRedo(history)).toBe(false);
  });

  it("does not crash when undoing past the beginning", () => {
    const initialHistory = createEditorHistory(createBlankMapDefinition(3, 3));
    const history = undoHistory(undoHistory(initialHistory));

    expect(history).toBe(initialHistory);
    expect(canUndo(history)).toBe(false);
  });

  it("does not crash when redoing past the end", () => {
    const initialHistory = createEditorHistory(createBlankMapDefinition(3, 3));
    const history = redoHistory(redoHistory(initialHistory));

    expect(history).toBe(initialHistory);
    expect(canRedo(history)).toBe(false);
  });
});
