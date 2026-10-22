import { describe, expect, it } from "vitest";
import { sanitizeSignatureData } from "./signature-schema";
import { defaultSignatureData } from "./types";

describe("sanitizeSignatureData", () => {
  it("returns defaults for non-object input", () => {
    for (const input of [null, undefined, 42, "x", []]) {
      expect(sanitizeSignatureData(input)).toEqual(defaultSignatureData);
    }
  });

  it("keeps valid data unchanged", () => {
    const data = structuredClone(defaultSignatureData);
    data.name = "Jane Doe";
    data.socialLinks = [{ platform: "github", url: "janedoe" }];
    data.profileImage = "data:image/jpeg;base64,AAAA";
    expect(sanitizeSignatureData(structuredClone(data))).toEqual(data);
  });

  it("replaces fields with the wrong shape per field", () => {
    const result = sanitizeSignatureData({
      name: 7,
      email: "jane@example.com",
      titles: "Lead",
      socialLinks: { platform: "github" },
      colors: { nameColor: "red", linkColor: "#00ff00" },
      fonts: { fontFamily: "Comic Sans", nameSize: 999, textSize: "10" },
      layout: { imageShape: "hexagon", imageSize: -5, showSignoff: "yes" },
    });

    expect(result.name).toBe("");
    expect(result.email).toBe("jane@example.com");
    expect(result.titles).toEqual(defaultSignatureData.titles);
    expect(result.socialLinks).toEqual([]);
    expect(result.colors.nameColor).toBe(defaultSignatureData.colors.nameColor);
    expect(result.colors.linkColor).toBe("#00ff00");
    expect(result.fonts.fontFamily).toBe(defaultSignatureData.fonts.fontFamily);
    expect(result.fonts.nameSize).toBe(30);
    expect(result.fonts.textSize).toBe(10);
    expect(result.layout.imageShape).toBe("circle");
    expect(result.layout.imageSize).toBe(40);
    expect(result.layout.showSignoff).toBe(false);
  });

  it("maps unknown platforms to custom and drops malformed list entries", () => {
    const result = sanitizeSignatureData({
      socialLinks: [{ platform: "myspace", url: "example.com" }, null, 3],
      titles: [{ title: "Lead" }, "bad"],
    });

    expect(result.socialLinks).toEqual([
      { platform: "custom", url: "example.com" },
    ]);
    expect(result.titles).toEqual([
      { title: "Lead", organization: "", url: "" },
    ]);
  });

  it("only accepts raster data URLs or http(s) URLs for the photo", () => {
    const photo = (profileImage: string) =>
      sanitizeSignatureData({ profileImage }).profileImage;

    expect(photo("data:image/svg+xml;base64,AA")).toBe("");
    expect(photo("javascript:alert(1)")).toBe("");
    expect(photo("https://example.com/a.jpg")).toBe(
      "https://example.com/a.jpg",
    );
  });
});
