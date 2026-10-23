// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import {
  copyMessage,
  copyPlainText,
  copyRichHtml,
  type ClipboardEnv,
} from "./clipboard";

class FakeClipboardItem {
  constructor(public items: Record<string, Blob>) {}
}

function env(overrides: Partial<ClipboardEnv> = {}): ClipboardEnv {
  return {
    clipboard: {
      write: vi.fn().mockResolvedValue(undefined),
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    ClipboardItem: FakeClipboardItem as unknown as typeof ClipboardItem,
    document,
    ...overrides,
  };
}

describe("copyRichHtml", () => {
  it("writes html and plain text flavors", async () => {
    const e = env();
    expect(await copyRichHtml("<b>Jane</b>", e)).toBe("copied");
    const [[items]] = vi.mocked(e.clipboard!.write).mock.calls;
    const item = items[0] as unknown as FakeClipboardItem;
    expect(Object.keys(item.items)).toEqual(["text/html", "text/plain"]);
  });

  it("reports a plain-text fallback when rich copy fails", async () => {
    const e = env();
    vi.mocked(e.clipboard!.write).mockRejectedValue(new Error("denied"));
    expect(await copyRichHtml("<b>Jane</b>", e)).toBe("fallback");
    expect(e.clipboard!.writeText).toHaveBeenCalledWith("<b>Jane</b>");
  });

  it("reports failure when every method fails", async () => {
    const e = env({ clipboard: undefined, ClipboardItem: undefined });
    document.execCommand = vi.fn().mockReturnValue(false);
    expect(await copyRichHtml("<b>Jane</b>", e)).toBe("failed");
  });
});

describe("copyPlainText", () => {
  it("uses a textarea fallback and restores focus", async () => {
    const button = document.createElement("button");
    document.body.appendChild(button);
    button.focus();
    document.execCommand = vi.fn().mockReturnValue(true);

    expect(await copyPlainText("hi", env({ clipboard: undefined }))).toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(document.activeElement).toBe(button);
    expect(document.querySelector("textarea")).toBeNull();
  });
});

describe("copyMessage", () => {
  it("names the action and explains the fallback", () => {
    expect(copyMessage("typst", "copied")).toBe("Typst copied to clipboard.");
    expect(copyMessage("signature", "fallback")).toContain("plain text");
    expect(copyMessage("html", "failed")).toContain("Could not copy HTML");
  });
});
