import { FOOTER_STORAGE_KEY } from "./footer-store";
import { STORAGE_KEY } from "./store";

export const OWNED_LOCAL_STORAGE_KEYS = [
  STORAGE_KEY,
  FOOTER_STORAGE_KEY,
] as const;

/** Remove each key, reporting any the browser refused so the caller can tell the person. */
export function removeOwnedStorageKeys(
  storage: Pick<Storage, "removeItem">,
  keys: readonly string[],
): { removed: string[]; failed: string[] } {
  const removed: string[] = [];
  const failed: string[] = [];
  for (const key of keys) {
    try {
      storage.removeItem(key);
      removed.push(key);
    } catch {
      failed.push(key);
    }
  }
  return { removed, failed };
}
