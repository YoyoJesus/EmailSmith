// @vitest-environment jsdom
import { flushSync, mount, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import AppHeader from "./AppHeader.svelte";
import TabBar from "./TabBar.svelte";

let component: Record<string, unknown> | undefined;

afterEach(() => {
  if (component) unmount(component);
  component = undefined;
  document.body.innerHTML = "";
});

function header(props: Partial<Record<string, unknown>> = {}) {
  const handlers = {
    onCopySignature: vi.fn(),
    onCopyHtml: vi.fn(),
    onCopyTypst: vi.fn(),
    onDownload: vi.fn(),
    onClearData: vi.fn(),
  };
  component = mount(AppHeader, {
    target: document.body,
    props: {
      viewMode: "preview",
      copyStatus: "",
      copied: null,
      ...handlers,
      ...props,
    },
  });
  const copyButton = [...document.querySelectorAll("button")].find((b) =>
    /Cop/.test(b.textContent ?? ""),
  )!;
  return { handlers, copyButton };
}

describe("AppHeader copy feedback", () => {
  it("calls the signature copy handler", () => {
    const { handlers, copyButton } = header();
    expect(copyButton.textContent?.trim()).toBe("Copy signature");
    copyButton.click();
    expect(handlers.onCopySignature).toHaveBeenCalledOnce();
  });

  it("only marks the signature button for signature copies", () => {
    expect(
      header({ copied: { action: "html", outcome: "copied" } }).copyButton
        .textContent,
    ).toContain("Copy signature");
  });

  it("distinguishes rich copy, fallback, and failure", () => {
    expect(
      header({ copied: { action: "signature", outcome: "copied" } }).copyButton
        .textContent,
    ).toContain("Copied");
    unmount(component!);
    document.body.innerHTML = "";
    expect(
      header({ copied: { action: "signature", outcome: "fallback" } })
        .copyButton.textContent,
    ).toContain("Copied as HTML");
  });

  it("shows the status message in a live region", () => {
    header({ copyStatus: "HTML copied to clipboard." });
    const status = document.querySelector('[role="status"]');
    expect(status?.getAttribute("aria-live")).toBe("polite");
    expect(status?.textContent?.trim()).toBe("HTML copied to clipboard.");
  });

  it("runs menu copy actions", async () => {
    const { handlers } = header();
    document
      .querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!
      .click();
    await Promise.resolve();
    flushSync();
    const item = [...document.querySelectorAll('[role="menuitem"]')].find(
      (el) => el.textContent?.includes("Copy Typst"),
    ) as HTMLElement;
    item.click();
    expect(handlers.onCopyTypst).toHaveBeenCalledOnce();
    expect(handlers.onCopySignature).not.toHaveBeenCalled();
  });
});

describe("TabBar", () => {
  const tabs = [
    { id: "info", label: "Info", group: "content" },
    { id: "photo", label: "Photo", group: "content" },
    { id: "colors", label: "Colors", group: "appearance" },
  ] as const;

  it("exposes tabs with selection state and arrow-key navigation", async () => {
    const props = { activeTab: "info" };
    component = mount(TabBar, {
      target: document.body,
      props: {
        tabs: [...tabs],
        idPrefix: "t",
        get activeTab() {
          return props.activeTab;
        },
        set activeTab(value: string) {
          props.activeTab = value;
        },
      },
    });

    const tablist = document.querySelector('[role="tablist"]')!;
    const all = [...document.querySelectorAll('[role="tab"]')];
    expect(all.map((t) => t.getAttribute("aria-selected"))).toEqual([
      "true",
      "false",
      "false",
    ]);
    expect(all[0].getAttribute("aria-controls")).toBe("t-panel");

    tablist.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
    );
    expect(props.activeTab).toBe("colors");
  });
});
