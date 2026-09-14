import { describe, expect, it } from "vitest";
import { generateSignatureHtml } from "./html-generator";
import { defaultSignatureData, type SignatureData } from "./types";

function signature(overrides: Partial<SignatureData> = {}): SignatureData {
  return {
    ...structuredClone(defaultSignatureData),
    ...overrides,
  };
}

describe("generateSignatureHtml", () => {
  it("escapes user-controlled text and attributes", () => {
    const html = generateSignatureHtml(
      signature({
        name: "<Jane & Doe>",
        email: 'jane@example.com" onmouseover="alert(1)',
        website: "example.com/?q=<unsafe>",
      }),
    );

    expect(html).toContain("&lt;Jane &amp; Doe&gt;");
    expect(html).toContain(
      "mailto:jane@example.com&quot; onmouseover=&quot;alert(1)",
    );
    expect(html).toContain("https://example.com/?q=&lt;unsafe&gt;");
    expect(html).not.toContain("<Jane & Doe>");
  });

  it("normalizes bare website and organization URLs", () => {
    const html = generateSignatureHtml(
      signature({
        subtitleOrganization: "Example Org",
        subtitleUrl: "example.org",
        website: "example.com",
      }),
    );

    expect(html).toContain('href="https://example.org"');
    expect(html).toContain('href="https://example.com"');
  });

  it("renders the selected layout and omits empty optional content", () => {
    const data = signature({ name: "Jane Doe" });
    data.layout.layout = "stacked";

    const html = generateSignatureHtml(data);

    expect(html).toContain("Jane Doe");
    expect(html).not.toContain("Profile photo");
    expect(html).not.toContain("mailto:");
  });
});
