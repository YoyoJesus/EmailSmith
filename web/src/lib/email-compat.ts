import { normalizeUrl } from "./links";
import type { SignatureData } from "./types";

export type ClientMode = "browser" | "dark" | "images-off" | "outlook";

export const CLIENT_MODES: { id: ClientMode; label: string; hint: string }[] = [
  { id: "browser", label: "Browser", hint: "Full browser rendering" },
  {
    id: "dark",
    label: "Dark mode",
    hint: "Approximates clients that invert colors in dark mode",
  },
  {
    id: "images-off",
    label: "Images off",
    hint: "Images are blocked, so alt text is shown",
  },
  {
    id: "outlook",
    label: "Outlook",
    hint: "Classic Outlook for Windows ignores border-radius and object-fit",
  },
];

const OUTLOOK_UNSUPPORTED = /^\s*(border-radius|object-fit)\s*:/i;

/**
 * Approximate a client's constraints on the generated HTML for preview. Dark mode is applied with CSS by the
 * preview, so the markup is unchanged for it.
 */
export function simulateClient(
  html: string,
  mode: ClientMode,
  parser: DOMParser = new DOMParser(),
): string {
  if (mode === "browser" || mode === "dark") return html;
  const doc = parser.parseFromString(
    `<!DOCTYPE html><body>${html}</body>`,
    "text/html",
  );

  if (mode === "outlook") {
    for (const el of doc.body.querySelectorAll<HTMLElement>("[style]")) {
      const kept = (el.getAttribute("style") ?? "")
        .split(";")
        .filter((rule) => rule.trim() && !OUTLOOK_UNSUPPORTED.test(rule))
        .join(";");
      el.setAttribute("style", kept);
    }
  }

  if (mode === "images-off") {
    for (const img of doc.body.querySelectorAll("img")) {
      const placeholder = doc.createElement("span");
      placeholder.textContent = img.getAttribute("alt") ?? "";
      const width = img.getAttribute("width");
      const height = img.getAttribute("height");
      const box = Number(width) > 24;
      placeholder.setAttribute(
        "style",
        box
          ? `display: inline-flex; align-items: center; justify-content: center; width: ${width}px; height: ${height}px; border: 1px dashed #9ca3af; font-size: 11px; color: #6b7280; text-align: center;`
          : "display: inline-block; margin-right: 4px; font-size: 11px; color: #6b7280; text-decoration: underline;",
      );
      img.replaceWith(placeholder);
    }
  }

  return doc.body.innerHTML;
}

export interface CompatibilityWarning {
  id: string;
  message: string;
}

/** Explain settings that common email clients will not render as previewed. */
export function compatibilityWarnings(
  data: SignatureData,
): CompatibilityWarning[] {
  const warnings: CompatibilityWarning[] = [];
  const hostedUrl = data.profileImageUrl.trim();
  const hasImage = !!(hostedUrl || data.profileImage);

  if (data.profileImage && !hostedUrl) {
    warnings.push({
      id: "embedded-photo",
      message:
        "The photo is embedded as a data URL. Gmail and Outlook usually block these, so add a hosted image URL in the Photo tab.",
    });
  }
  if (hostedUrl && normalizeUrl(hostedUrl).toLowerCase().startsWith("http:")) {
    warnings.push({
      id: "insecure-photo",
      message:
        "The hosted photo uses http. Some clients block images that are not served over https.",
    });
  }
  if (hasImage && data.layout.imageShape !== "square") {
    warnings.push({
      id: "photo-shape",
      message:
        "Classic Outlook for Windows ignores border-radius, so a circle or rounded photo appears square there. Upload a photo that is already round, or choose the square shape.",
    });
  }
  if (data.socialLinks.some((s) => s.url.trim())) {
    warnings.push({
      id: "social-icons",
      message:
        "Social icons are embedded SVG images. Gmail and classic Outlook do not display them, so recipients may see platform names instead.",
    });
  }
  return warnings;
}
