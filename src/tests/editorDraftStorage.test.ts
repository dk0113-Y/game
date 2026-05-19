import { describe, expect, it } from "vitest";
import {
  loadEditorDraftMap,
  loadMapDraft,
  MAP_EDITOR_DRAFT_STORAGE_KEY,
  saveEditorDraftMap,
  saveMapDraft,
} from "../game/editor/editorDraftStorage";
import {
  createBlankMapDefinition,
  serializeMapDefinition,
} from "../game/editor/mapSerialization";

class MemoryStorage implements Pick<Storage, "getItem" | "setItem"> {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("editor draft storage", () => {
  it("saves and loads a serialized map draft", () => {
    const storage = new MemoryStorage();
    const map = createBlankMapDefinition(3, 3);

    saveMapDraft(storage, map);
    const loaded = loadMapDraft(storage);

    expect(storage.getItem(MAP_EDITOR_DRAFT_STORAGE_KEY)).toBe(
      serializeMapDefinition(map),
    );
    expect(loaded).toEqual({
      ok: true,
      map,
    });
  });

  it("returns a parse failure result for invalid draft JSON", () => {
    const storage = new MemoryStorage();
    storage.setItem(MAP_EDITOR_DRAFT_STORAGE_KEY, "{");

    const loaded = loadMapDraft(storage);

    expect(loaded?.ok).toBe(false);
  });

  it("does not throw when loading an invalid draft map", () => {
    const storage = new MemoryStorage();
    storage.setItem(MAP_EDITOR_DRAFT_STORAGE_KEY, "{");

    expect(loadEditorDraftMap(storage)).toBeUndefined();
  });

  it("supports the browser-facing save and load helpers", () => {
    const storage = new MemoryStorage();
    const map = createBlankMapDefinition(3, 3);

    saveEditorDraftMap(map, storage);

    expect(loadEditorDraftMap(storage)).toEqual(map);
  });
});
