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

  it("drops unsafe link schemes and keeps mailto in URL fields", () => {
    const html = generateSignatureHtml(
      signature({
        website: "javascript:alert(1)",
        ctaText: "Write me",
        ctaUrl: "mailto:jane@example.com",
      }),
    );

    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('href="mailto:jane@example.com"');
    expect(html).not.toContain("https://mailto:");
  });

  it("dials only digits and a leading plus", () => {
    const html = generateSignatureHtml(
      signature({ phone: "+1 (555) 555-0100" }),
    );

    expect(html).toContain('href="tel:+15555550100"');
    expect(html).toContain(">+1 (555) 555-0100</a>");
  });

  it("labels social icons and expands usernames", () => {
    const html = generateSignatureHtml(
      signature({
        socialLinks: [
          { platform: "stackoverflow", url: "stackoverflow.com/users/1" },
          { platform: "github", url: "janedoe" },
        ],
      }),
    );

    expect(html).toContain('alt="Stack Overflow"');
    expect(html).toContain('href="https://github.com/janedoe"');
    expect(html).not.toContain('alt="stackoverflow"');
  });

  it("uses the accent color for the action link", () => {
    const data = signature({ ctaText: "Book", ctaUrl: "cal.example.com" });
    data.colors.accentColor = "#ff0000";

    expect(generateSignatureHtml(data)).toMatch(
      /href="https:\/\/cal\.example\.com" style="[^"]*color: #ff0000/,
    );
  });

  it("places one divider between each pair of adjacent groups", () => {
    const dividers = (data: SignatureData) =>
      generateSignatureHtml(data).split("border-top: 1px").length - 1;
    const base = {
      name: "Jane Doe",
      subtitleText: "Student",
      email: "jane@example.com",
    };

    expect(dividers(signature(base))).toBe(1);
    expect(
      dividers(
        signature({
          ...base,
          titles: [{ title: "Lead", organization: "", url: "" }],
        }),
      ),
    ).toBe(2);
    const stacked = signature(base);
    stacked.layout.layout = "stacked";
    expect(dividers(stacked)).toBe(1);
  });
});
