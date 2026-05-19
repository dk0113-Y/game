import type { MapDefinition } from "../data/maps/mapTypes";

export interface EditorHistory {
  past: MapDefinition[];
  present: MapDefinition;
  future: MapDefinition[];
}

export function areMapDefinitionsEqual(
  first: MapDefinition,
  second: MapDefinition,
) {
  return JSON.stringify(first) === JSON.stringify(second);
}

export function createEditorHistory(initialMap: MapDefinition): EditorHistory {
  return {
    past: [],
    present: initialMap,
    future: [],
  };
}

export function pushHistory(
  history: EditorHistory,
  nextMap: MapDefinition,
): EditorHistory {
  if (areMapDefinitionsEqual(history.present, nextMap)) {
    return history;
  }

  return {
    past: [...history.past, history.present],
    present: nextMap,
    future: [],
  };
}

export function undoHistory(history: EditorHistory): EditorHistory {
  if (!canUndo(history)) {
    return history;
  }

  const previous = history.past[history.past.length - 1];

  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redoHistory(history: EditorHistory): EditorHistory {
  if (!canRedo(history)) {
    return history;
  }

  const next = history.future[0];

  return {
    past: [...history.past, history.present],
    present: next,
    future: history.future.slice(1),
  };
}

export function canUndo(history: EditorHistory) {
  return history.past.length > 0;
}

export function canRedo(history: EditorHistory) {
  return history.future.length > 0;
}
