import { describe, expect, it } from "vitest";
import { fileStem, htmlDocument } from "./download";

describe("fileStem", () => {
  it("keeps safe characters and falls back when empty", () => {
    expect(fileStem("Work signature")).toBe("Work-signature");
    expect(fileStem("../../etc/passwd")).toBe("etc-passwd");
    expect(fileStem("Café")).toBe("Cafe");
    expect(fileStem("***")).toBe("signature");
  });
});

describe("htmlDocument", () => {
  it("wraps the signature in a UTF-8 document", () => {
    const doc = htmlDocument("<table></table>");
    expect(doc.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(doc).toContain('<meta charset="utf-8">');
    expect(doc).toContain("<body>\n<table></table>\n</body>");
  });
});
