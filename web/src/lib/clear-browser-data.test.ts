import { describe, expect, it } from "vitest";
import {
  OWNED_LOCAL_STORAGE_KEYS,
  removeOwnedStorageKeys,
} from "./clear-browser-data";

describe("removeOwnedStorageKeys", () => {
  it("owns the signature and footer keys", () => {
    expect(OWNED_LOCAL_STORAGE_KEYS).toEqual([
      "email-signature-data",
      "footerCollapsed",
    ]);
  });

  it("removes every key", () => {
    const removedKeys: string[] = [];
    const result = removeOwnedStorageKeys(
      { removeItem: (key) => removedKeys.push(key) },
      ["a", "b"],
    );
    expect(removedKeys).toEqual(["a", "b"]);
    expect(result).toEqual({ removed: ["a", "b"], failed: [] });
  });

  it("reports keys the browser refuses", () => {
    const result = removeOwnedStorageKeys(
      {
        removeItem: (key) => {
          if (key === "b") throw new Error("blocked");
        },
      },
      ["a", "b"],
    );
    expect(result).toEqual({ removed: ["a"], failed: ["b"] });
  });
});
