import { get } from "svelte/store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FOOTER_STORAGE_KEY, footerStore } from "./footer-store";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("footerStore", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", memoryStorage());
    footerStore.reset();
  });

  afterEach(() => vi.unstubAllGlobals());

  it("starts visible and toggles", () => {
    expect(get(footerStore)).toBe(false);
    footerStore.toggle();
    expect(get(footerStore)).toBe(true);
  });

  it("persists only the hidden state", () => {
    footerStore.toggle();
    footerStore.saveToStorage();
    expect(localStorage.getItem(FOOTER_STORAGE_KEY)).toBe("true");
    footerStore.toggle();
    footerStore.saveToStorage();
    expect(localStorage.getItem(FOOTER_STORAGE_KEY)).toBeNull();
  });

  it("loads the saved preference", () => {
    localStorage.setItem(FOOTER_STORAGE_KEY, "true");
    footerStore.loadFromStorage();
    expect(get(footerStore)).toBe(true);
  });

  it("falls back to visible when storage throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
    });
    footerStore.loadFromStorage();
    expect(get(footerStore)).toBe(false);
  });
});
