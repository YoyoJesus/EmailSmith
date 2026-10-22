import { describe, expect, it } from "vitest";
import { moveAt } from "./reorder";

describe("moveAt", () => {
  it("swaps adjacent items", () => {
    expect(moveAt(["a", "b", "c"], 0, 1)).toEqual(["b", "a", "c"]);
    expect(moveAt(["a", "b", "c"], 2, -1)).toEqual(["a", "c", "b"]);
  });

  it("returns the same array at a boundary or invalid index", () => {
    const items = ["a", "b"];
    expect(moveAt(items, 0, -1)).toBe(items);
    expect(moveAt(items, 1, 1)).toBe(items);
    expect(moveAt(items, 5, 1)).toBe(items);
    expect(moveAt(items, 0.5, 1)).toBe(items);
  });

  it("does not mutate the input", () => {
    const items = ["a", "b"];
    moveAt(items, 0, 1);
    expect(items).toEqual(["a", "b"]);
  });
});
