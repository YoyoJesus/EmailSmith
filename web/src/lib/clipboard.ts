export type CopyAction = "signature" | "html" | "typst";

/** "fallback" means rich copy failed and the HTML source was copied as plain text instead. */
export type CopyOutcome = "copied" | "fallback" | "failed";

export interface ClipboardEnv {
  clipboard?: Pick<Clipboard, "write" | "writeText">;
  ClipboardItem?: typeof ClipboardItem;
  document: Document;
}

function browserEnv(): ClipboardEnv {
  return {
    clipboard: navigator.clipboard,
    ClipboardItem: globalThis.ClipboardItem,
    document,
  };
}

// Older browsers and non-secure contexts lack the async clipboard API, so a selected textarea is copied instead.
function execCommandCopy(text: string, doc: Document): boolean {
  const previousFocus =
    doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
  const textarea = doc.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  doc.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = doc.execCommand("copy");
  } catch {
    copied = false;
  }
  doc.body.removeChild(textarea);
  previousFocus?.focus();
  return copied;
}

export async function copyPlainText(
  text: string,
  env: ClipboardEnv = browserEnv(),
): Promise<boolean> {
  try {
    if (!env.clipboard) throw new Error("Clipboard API unavailable");
    await env.clipboard.writeText(text);
    return true;
  } catch {
    return execCommandCopy(text, env.document);
  }
}

/** Copy formatted HTML so it pastes as a rendered signature, falling back to the HTML source as plain text. */
export async function copyRichHtml(
  html: string,
  env: ClipboardEnv = browserEnv(),
): Promise<CopyOutcome> {
  try {
    if (!env.clipboard || !env.ClipboardItem)
      throw new Error("Rich clipboard unavailable");
    await env.clipboard.write([
      new env.ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([html], { type: "text/plain" }),
      }),
    ]);
    return "copied";
  } catch {
    return (await copyPlainText(html, env)) ? "fallback" : "failed";
  }
}

const LABELS: Record<CopyAction, string> = {
  signature: "Signature",
  html: "HTML",
  typst: "Typst",
};

export function copyMessage(action: CopyAction, outcome: CopyOutcome): string {
  if (outcome === "failed")
    return `Could not copy ${LABELS[action]}. Open the ${action === "typst" ? "Typst" : "HTML"} view and copy the code manually.`;
  if (outcome === "fallback")
    return "This browser does not support rich copy, so the signature HTML source was copied as plain text. Paste it into an HTML signature editor.";
  return `${LABELS[action]} copied to clipboard.`;
}
