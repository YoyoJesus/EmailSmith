import { describe, expect, it } from "vitest";
import {
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  activeSignature,
  addSignature,
  createLibrary,
  exportSignature,
  importSignature,
  loadLibrary,
  removeSignature,
  renameSignature,
  saveLibrary,
} from "./store";
import { defaultSignatureData } from "./types";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}

function jane() {
  const data = structuredClone(defaultSignatureData);
  data.name = "Jane Doe";
  return data;
}

describe("loadLibrary", () => {
  it("starts with one default signature when nothing is saved", () => {
    const { library, status } = loadLibrary(memoryStorage());
    expect(status).toBe("empty");
    expect(library.signatures).toHaveLength(1);
    expect(activeSignature(library).data).toEqual(defaultSignatureData);
  });

  it("migrates the version 1 key and removes it after saving", () => {
    const storage = memoryStorage({
      [LEGACY_STORAGE_KEY]: JSON.stringify({ name: "Jane Doe" }),
    });
    const { library, status } = loadLibrary(storage);

    expect(status).toBe("ok");
    expect(activeSignature(library).data.name).toBe("Jane Doe");
    expect(activeSignature(library).data.titles).toEqual(
      defaultSignatureData.titles,
    );

    expect(saveLibrary(storage, library)).toEqual({ ok: true });
    expect(storage.values.has(LEGACY_STORAGE_KEY)).toBe(false);
    expect(loadLibrary(storage).library).toEqual(library);
  });

  it("repairs malformed fields instead of failing", () => {
    const storage = memoryStorage({
      [LEGACY_STORAGE_KEY]: JSON.stringify({
        name: "Jane Doe",
        titles: null,
        socialLinks: "github",
      }),
    });
    const data = activeSignature(loadLibrary(storage).library).data;

    expect(data.name).toBe("Jane Doe");
    expect(Array.isArray(data.titles)).toBe(true);
    expect(data.socialLinks).toEqual([]);
  });

  it("reports unreadable data and loads defaults", () => {
    for (const raw of ["{not json", "[]", JSON.stringify({ signatures: [] })]) {
      const result = loadLibrary(memoryStorage({ [STORAGE_KEY]: raw }));
      expect(result.status).toBe("unreadable");
      expect(activeSignature(result.library).data).toEqual(
        defaultSignatureData,
      );
    }
  });

  it("reports blocked storage", () => {
    const storage = {
      getItem: () => {
        throw new DOMException("denied", "SecurityError");
      },
      setItem: () => {},
      removeItem: () => {},
    };
    expect(loadLibrary(storage).status).toBe("unreadable");
  });

  it("fixes a missing active id and duplicate ids", () => {
    const storage = memoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        version: 2,
        activeId: "missing",
        signatures: [
          { id: "a", name: "Work", data: jane() },
          { id: "a", name: "", data: {} },
        ],
      }),
    });
    const { library } = loadLibrary(storage);

    expect(library.activeId).toBe("a");
    expect(new Set(library.signatures.map((s) => s.id)).size).toBe(2);
    expect(library.signatures[1].name).toBe("Signature 2");
  });
});

describe("saveLibrary", () => {
  it("reports a full quota", () => {
    const storage = memoryStorage();
    storage.setItem = () => {
      throw new DOMException("full", "QuotaExceededError");
    };
    expect(saveLibrary(storage, createLibrary())).toEqual({
      ok: false,
      reason: "quota",
    });
  });

  it("reports other storage failures as blocked", () => {
    const storage = memoryStorage();
    storage.setItem = () => {
      throw new Error("nope");
    };
    expect(saveLibrary(storage, createLibrary())).toEqual({
      ok: false,
      reason: "blocked",
    });
  });
});

describe("signature list", () => {
  it("adds, renames, and removes signatures", () => {
    let library = createLibrary(jane(), "Work");
    const workId = library.activeId;

    library = addSignature(
      library,
      "  School  ",
      structuredClone(defaultSignatureData),
    );
    expect(activeSignature(library).name).toBe("School");

    library = renameSignature(library, workId, "Office");
    expect(library.signatures[0].name).toBe("Office");
    library = renameSignature(library, workId, "   ");
    expect(library.signatures[0].name).toBe("Office");

    library = removeSignature(library, library.activeId);
    expect(library.activeId).toBe(workId);
    expect(removeSignature(library, workId)).toBe(library);
  });
});

describe("export and import", () => {
  it("round-trips a signature", () => {
    const library = createLibrary(jane(), "Work");
    const result = importSignature(exportSignature(activeSignature(library)));

    expect(result).toEqual({ ok: true, name: "Work", data: jane() });
  });

  it("accepts a bare version 1 object", () => {
    const result = importSignature(JSON.stringify({ name: "Jane Doe" }));
    expect(result.ok && result.data.name).toBe("Jane Doe");
  });

  it("rejects files that are not signatures", () => {
    const files = [
      "nope",
      "[]",
      JSON.stringify({ hello: 1 }),
      JSON.stringify({ format: "emailsmith-signature" }),
    ];
    for (const json of files) {
      expect(importSignature(json)).toEqual({ ok: false });
    }
  });
});
