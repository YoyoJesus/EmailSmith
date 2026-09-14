import { writable } from "svelte/store";
import type { SignatureData } from "./types";
import { defaultSignatureData } from "./types";

const STORAGE_KEY = "email-signature-data";

function createSignatureStore() {
  const { subscribe, set, update } = writable<SignatureData>(
    structuredClone(defaultSignatureData),
  );

  return {
    subscribe,
    set,
    update,
    loadFromStorage(): SignatureData {
      if (typeof window === "undefined")
        return structuredClone(defaultSignatureData);
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Merge with defaults to handle missing fields from older versions
          const merged = {
            ...structuredClone(defaultSignatureData),
            ...parsed,
          };
          merged.colors = { ...defaultSignatureData.colors, ...parsed.colors };
          merged.fonts = { ...defaultSignatureData.fonts, ...parsed.fonts };
          merged.layout = { ...defaultSignatureData.layout, ...parsed.layout };
          set(merged);
          return merged;
        }
      } catch {
        // ignore
      }
      return structuredClone(defaultSignatureData);
    },
    saveToStorage(data: SignatureData) {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        // ignore
      }
    },
  };
}

export const signatureStore = createSignatureStore();
