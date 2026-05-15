import { describe, expect, it } from "vitest";
import {
  getHexNeighbors,
  hexDistance,
  hexToId,
  isHexAdjacent,
} from "../game/core/hex";

describe("hex utilities", () => {
  it("returns 6 axial neighbors", () => {
    const neighbors = getHexNeighbors({ q: 0, r: 0 });

    expect(neighbors).toHaveLength(6);
    expect(neighbors).toContainEqual({ q: 1, r: 0 });
    expect(neighbors).toContainEqual({ q: 1, r: -1 });
    expect(neighbors).toContainEqual({ q: 0, r: -1 });
    expect(neighbors).toContainEqual({ q: -1, r: 0 });
    expect(neighbors).toContainEqual({ q: -1, r: 1 });
    expect(neighbors).toContainEqual({ q: 0, r: 1 });
  });

  it("reports distance 1 for adjacent hexes", () => {
    expect(hexDistance({ q: 2, r: 2 }, { q: 3, r: 2 })).toBe(1);
    expect(isHexAdjacent({ q: 2, r: 2 }, { q: 3, r: 2 })).toBe(true);
  });

  it("creates stable hex ids", () => {
    expect(hexToId(2, 3)).toBe("hex-2-3");
  });
});
