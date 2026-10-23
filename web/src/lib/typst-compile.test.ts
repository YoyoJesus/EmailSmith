import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { generateTypstCode } from "./typst-generator";
import { defaultSignatureData, type SignatureData } from "./types";

// CI sets TYPST_REQUIRED=1 and installs the Typst CLI; locally the suite is skipped when typst is missing.
function hasTypst(): boolean {
  try {
    execFileSync("typst", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    if (process.env.TYPST_REQUIRED) throw new Error("typst CLI not found");
    return false;
  }
}

const HOSTILE =
  "a_b *c* #d $e$ @f <g> [h] `i` ~j // k /* l -m +n =o \\p \"q\" 'r' s: t...";

function hostileData(): SignatureData {
  const data = structuredClone(defaultSignatureData);
  data.name = HOSTILE;
  data.pronouns = "they/them";
  data.subtitleText = "- " + HOSTILE;
  data.subtitleOrganization = "= Org";
  data.subtitleUrl = "example.org/a_b#c";
  data.titles = [
    { title: "+ Lead", organization: "`Club`", url: 'example.com/"q"\\' },
  ];
  data.email = "jane_doe@example.com";
  data.phone = "+1 (555) 555-0100";
  data.website = "example.com//jane_doe";
  data.socialLinks = [
    { platform: "github", url: "jane_doe" },
    { platform: "stackoverflow", url: "https://stackoverflow.com/users/1/x_y" },
  ];
  data.ctaText = "Book // now";
  data.ctaUrl = "cal.example.com/jane_doe";
  data.layout.showSignoff = true;
  data.layout.signoffText = "= Thanks, // [x]";
  return data;
}

const dir = mkdtempSync(join(tmpdir(), "emailsmith-typst-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

function compile(source: string): string {
  const input = join(dir, "signature.typ");
  const output = join(dir, "signature.svg");
  writeFileSync(input, source);
  execFileSync("typst", ["compile", input, output], { stdio: "pipe" });
  return readFileSync(output, "utf8");
}

describe.runIf(hasTypst())("generated Typst compiles", () => {
  for (const divider of ["solid", "dashed", "dotted", "none"] as const) {
    it(`compiles hostile input with a ${divider} divider`, () => {
      const data = hostileData();
      data.layout.dividerStyle = divider;
      expect(() => compile(generateTypstCode(data))).not.toThrow();
    });
  }

  it("keeps link targets unescaped", () => {
    const svg = compile(generateTypstCode(hostileData()));
    expect(svg).toContain("https://example.com//jane_doe");
    expect(svg).toContain("mailto:jane_doe@example.com");
    expect(svg).toContain("tel:+15555550100");
    expect(svg).toContain("https://github.com/jane_doe");
    expect(svg).not.toMatch(/href="[^"]*\\_/);
  });
});
