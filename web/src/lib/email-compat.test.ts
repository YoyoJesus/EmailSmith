// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { compatibilityWarnings, simulateClient } from "./email-compat";
import { generateSignatureHtml } from "./html-generator";
import { defaultSignatureData } from "./types";

function data() {
  const d = structuredClone(defaultSignatureData);
  d.name = "Jane Doe";
  d.profileImageUrl = "https://example.com/me.jpg";
  d.socialLinks = [{ platform: "github", url: "janedoe" }];
  return d;
}

describe("simulateClient", () => {
  it("leaves markup unchanged in browser and dark modes", () => {
    const html = generateSignatureHtml(data());
    expect(simulateClient(html, "browser")).toBe(html);
    expect(simulateClient(html, "dark")).toBe(html);
  });

  it("strips border-radius and object-fit for Outlook", () => {
    const out = simulateClient(generateSignatureHtml(data()), "outlook");
    expect(out).not.toMatch(/border-radius|object-fit/);
    expect(out).toContain("display: block");
  });

  it("replaces images with their alt text when images are off", () => {
    const out = simulateClient(generateSignatureHtml(data()), "images-off");
    expect(out).not.toContain("<img");
    expect(out).toContain(">Profile photo</span>");
    expect(out).toContain(">GitHub</span>");
  });
});

describe("compatibilityWarnings", () => {
  const ids = (d: ReturnType<typeof data>) =>
    compatibilityWarnings(d).map((w) => w.id);

  it("flags rounded photos and SVG social icons", () => {
    expect(ids(data())).toEqual(["photo-shape", "social-icons"]);
  });

  it("flags embedded and http photos", () => {
    const embedded = data();
    embedded.profileImageUrl = "";
    embedded.profileImage = "data:image/jpeg;base64,AAAA";
    embedded.layout.imageShape = "square";
    embedded.socialLinks = [];
    expect(ids(embedded)).toEqual(["embedded-photo"]);

    const insecure = data();
    insecure.profileImageUrl = "http://example.com/me.jpg";
    expect(ids(insecure)).toContain("insecure-photo");
  });

  it("has no warnings for a text-only signature", () => {
    expect(compatibilityWarnings(defaultSignatureData)).toEqual([]);
  });
});
