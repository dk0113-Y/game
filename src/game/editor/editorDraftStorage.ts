import type { MapDefinition } from "../data/maps/mapTypes";
import { parseMapDefinition, serializeMapDefinition } from "./mapSerialization";

export const MAP_EDITOR_DRAFT_STORAGE_KEY =
  "tribe-to-realm:map-editor:draft";

type DraftStorageReader = Pick<Storage, "getItem">;
type DraftStorageWriter = Pick<Storage, "setItem">;
type DraftStorageRemover = Pick<Storage, "removeItem">;

export type LoadEditorDraftMapResult =
  | {
      ok: true;
      map: MapDefinition;
    }
  | {
      ok: false;
      error: Error;
    };

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function getBrowserStorage() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage;
}

export function saveEditorDraftMap(
  map: MapDefinition,
  storage: DraftStorageWriter | undefined = getBrowserStorage(),
) {
  if (!storage) {
    return;
  }

  storage.setItem(MAP_EDITOR_DRAFT_STORAGE_KEY, serializeMapDefinition(map));
}

export function readEditorDraftMap(
  storage: DraftStorageReader | undefined = getBrowserStorage(),
): LoadEditorDraftMapResult | undefined {
  if (!storage) {
    return undefined;
  }

  try {
    const draft = storage.getItem(MAP_EDITOR_DRAFT_STORAGE_KEY);
    if (draft === null) {
      return undefined;
    }

    return {
      ok: true,
      map: parseMapDefinition(draft),
    };
  } catch (error) {
    return {
      ok: false,
      error: toError(error),
    };
  }
}

export function loadEditorDraftMap(
  storage: DraftStorageReader | undefined = getBrowserStorage(),
) {
  const draft = readEditorDraftMap(storage);

  return draft?.ok ? draft.map : undefined;
}

export function clearEditorDraftMap(
  storage: DraftStorageRemover | undefined = getBrowserStorage(),
) {
  storage?.removeItem(MAP_EDITOR_DRAFT_STORAGE_KEY);
}

export const saveMapDraft = (
  storage: DraftStorageWriter,
  map: MapDefinition,
) => saveEditorDraftMap(map, storage);

export const loadMapDraft = readEditorDraftMap;
