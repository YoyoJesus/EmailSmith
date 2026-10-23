import { sanitizeSignatureData } from "./signature-schema";
import { defaultSignatureData, type SignatureData } from "./types";

/** Version 1 stored a single SignatureData object under this key. It is migrated and removed on first load. */
export const LEGACY_STORAGE_KEY = "email-signature-data";
export const STORAGE_KEY = "emailsmith-signatures";
export const STORAGE_VERSION = 2;

export interface SavedSignature {
  id: string;
  name: string;
  data: SignatureData;
}

export interface SignatureLibrary {
  version: typeof STORAGE_VERSION;
  activeId: string;
  signatures: SavedSignature[];
}

/** "unreadable" means saved data existed but could not be parsed or accessed, so defaults were loaded. */
export type LoadStatus = "empty" | "ok" | "unreadable";

export const MAX_SIGNATURE_NAME_LENGTH = 60;
const MAX_SIGNATURES = 20;

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function signatureName(raw: unknown, fallback: string): string {
  const name =
    typeof raw === "string"
      ? raw.trim().slice(0, MAX_SIGNATURE_NAME_LENGTH)
      : "";
  return name || fallback;
}

export function createLibrary(
  data: SignatureData = structuredClone(defaultSignatureData),
  name = "My signature",
): SignatureLibrary {
  const id = newId();
  return {
    version: STORAGE_VERSION,
    activeId: id,
    signatures: [{ id, name, data }],
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validate a parsed library. Returns null when the overall shape is unusable. */
export function sanitizeLibrary(input: unknown): SignatureLibrary | null {
  if (!isRecord(input) || !Array.isArray(input.signatures)) return null;
  const seen = new Set<string>();
  const signatures: SavedSignature[] = [];
  for (const entry of input.signatures.slice(0, MAX_SIGNATURES)) {
    if (!isRecord(entry)) continue;
    let id = typeof entry.id === "string" && entry.id ? entry.id : newId();
    if (seen.has(id)) id = newId();
    seen.add(id);
    signatures.push({
      id,
      name: signatureName(entry.name, `Signature ${signatures.length + 1}`),
      data: sanitizeSignatureData(entry.data),
    });
  }
  if (signatures.length === 0) return null;
  const activeId = signatures.some((s) => s.id === input.activeId)
    ? (input.activeId as string)
    : signatures[0].id;
  return { version: STORAGE_VERSION, activeId, signatures };
}

function parse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function loadLibrary(storage: StorageLike): {
  library: SignatureLibrary;
  status: LoadStatus;
} {
  let raw: string | null;
  let legacyRaw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
    legacyRaw = raw === null ? storage.getItem(LEGACY_STORAGE_KEY) : null;
  } catch {
    return { library: createLibrary(), status: "unreadable" };
  }

  if (raw !== null) {
    const library = sanitizeLibrary(parse(raw));
    if (!library) return { library: createLibrary(), status: "unreadable" };
    return { library, status: "ok" };
  }

  if (legacyRaw !== null) {
    const parsed = parse(legacyRaw);
    if (!isRecord(parsed))
      return { library: createLibrary(), status: "unreadable" };
    return {
      library: createLibrary(sanitizeSignatureData(parsed)),
      status: "ok",
    };
  }

  return { library: createLibrary(), status: "empty" };
}

/** Persist the library, removing the legacy key once the new format is written. */
export function saveLibrary(
  storage: StorageLike,
  library: SignatureLibrary,
): { ok: true } | { ok: false; reason: "quota" | "blocked" } {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(library));
  } catch (error) {
    const quota =
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED");
    return { ok: false, reason: quota ? "quota" : "blocked" };
  }
  try {
    storage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // The new key is already written, and the legacy key is ignored once it exists.
  }
  return { ok: true };
}

export function activeSignature(library: SignatureLibrary): SavedSignature {
  return (
    library.signatures.find((s) => s.id === library.activeId) ??
    library.signatures[0]
  );
}

export function canAddSignature(library: SignatureLibrary): boolean {
  return library.signatures.length < MAX_SIGNATURES;
}

export function addSignature(
  library: SignatureLibrary,
  name: string,
  data: SignatureData,
): SignatureLibrary {
  if (!canAddSignature(library)) return library;
  const id = newId();
  return {
    ...library,
    activeId: id,
    signatures: [
      ...library.signatures,
      {
        id,
        name: signatureName(name, `Signature ${library.signatures.length + 1}`),
        data,
      },
    ],
  };
}

export function removeSignature(
  library: SignatureLibrary,
  id: string,
): SignatureLibrary {
  if (library.signatures.length <= 1) return library;
  const index = library.signatures.findIndex((s) => s.id === id);
  if (index === -1) return library;
  const signatures = library.signatures.filter((s) => s.id !== id);
  const activeId =
    library.activeId === id
      ? signatures[Math.min(index, signatures.length - 1)].id
      : library.activeId;
  return { ...library, activeId, signatures };
}

export function renameSignature(
  library: SignatureLibrary,
  id: string,
  name: string,
): SignatureLibrary {
  return {
    ...library,
    signatures: library.signatures.map((s) =>
      s.id === id ? { ...s, name: signatureName(name, s.name) } : s,
    ),
  };
}

export const EXPORT_FORMAT = "emailsmith-signature";

/** Serialize one signature for download. */
export function exportSignature(signature: SavedSignature): string {
  return JSON.stringify(
    {
      format: EXPORT_FORMAT,
      version: STORAGE_VERSION,
      name: signature.name,
      data: signature.data,
    },
    null,
    2,
  );
}

/**
 * Parse an exported signature file. Also accepts a bare SignatureData object, which is what version 1 stored.
 * Unknown or invalid fields fall back to defaults.
 */
export function importSignature(
  json: string,
): { ok: true; name: string; data: SignatureData } | { ok: false } {
  const parsed = parse(json);
  if (!isRecord(parsed)) return { ok: false };
  if (parsed.format === EXPORT_FORMAT) {
    if (!isRecord(parsed.data)) return { ok: false };
    return {
      ok: true,
      name: signatureName(parsed.name, "Imported signature"),
      data: sanitizeSignatureData(parsed.data),
    };
  }
  const known = Object.keys(defaultSignatureData);
  if (!Object.keys(parsed).some((key) => known.includes(key)))
    return { ok: false };
  return {
    ok: true,
    name: "Imported signature",
    data: sanitizeSignatureData(parsed),
  };
}
