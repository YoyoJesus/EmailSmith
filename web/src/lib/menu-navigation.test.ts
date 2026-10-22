import { describe, expect, it } from "vitest";
import { nextMenuIndex } from "./menu-navigation";

describe("nextMenuIndex", () => {
  it("wraps arrow keys at both ends", () => {
    expect(nextMenuIndex("ArrowDown", 2, 3)).toBe(0);
    expect(nextMenuIndex("ArrowUp", 0, 3)).toBe(2);
  });

  it("starts from the first or last item when nothing is focused", () => {
    expect(nextMenuIndex("ArrowDown", -1, 3)).toBe(0);
    expect(nextMenuIndex("ArrowUp", -1, 3)).toBe(2);
  });

  it("jumps with Home and End", () => {
    expect(nextMenuIndex("Home", 1, 4)).toBe(0);
    expect(nextMenuIndex("End", 1, 4)).toBe(3);
  });

  it("ignores other keys and empty menus", () => {
    expect(nextMenuIndex("Enter", 1, 3)).toBeNull();
    expect(nextMenuIndex("ArrowDown", 0, 0)).toBeNull();
  });
});
