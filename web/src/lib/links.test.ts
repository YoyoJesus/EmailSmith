import { describe, expect, it } from "vitest";
import {
  displayUrl,
  normalizePhone,
  normalizeUrl,
  resolveSocialUrl,
} from "./links";

describe("normalizeUrl", () => {
  it("adds https to bare hosts, including hosts that start with http", () => {
    expect(normalizeUrl("example.com")).toBe("https://example.com");
    expect(normalizeUrl("httpbin.org/get")).toBe("https://httpbin.org/get");
    expect(normalizeUrl("  example.com/jane_doe  ")).toBe(
      "https://example.com/jane_doe",
    );
    expect(normalizeUrl("//cdn.example.com/a.png")).toBe(
      "https://cdn.example.com/a.png",
    );
  });

  it("keeps allowed schemes and treats host:port as a host", () => {
    expect(normalizeUrl("http://example.com")).toBe("http://example.com");
    expect(normalizeUrl("HTTPS://example.com")).toBe("HTTPS://example.com");
    expect(normalizeUrl("mailto:jane@example.com")).toBe(
      "mailto:jane@example.com",
    );
    expect(normalizeUrl("tel:+15555550100")).toBe("tel:+15555550100");
    expect(normalizeUrl("example.com:8080/x")).toBe(
      "https://example.com:8080/x",
    );
  });

  it("drops unsafe or unknown schemes and empty input", () => {
    expect(normalizeUrl("javascript:alert(1)")).toBe("");
    expect(normalizeUrl("data:text/html,<b>x</b>")).toBe("");
    expect(normalizeUrl("ftp://example.com")).toBe("");
    expect(normalizeUrl("   ")).toBe("");
  });
});

describe("normalizePhone", () => {
  it("keeps digits and a leading plus", () => {
    expect(normalizePhone("(555) 555-0100")).toBe("5555550100");
    expect(normalizePhone("+1 555.555.0100")).toBe("+15555550100");
    expect(normalizePhone("ext")).toBe("");
  });
});

describe("displayUrl", () => {
  it("strips the scheme", () => {
    expect(displayUrl("https://example.com/a")).toBe("example.com/a");
    expect(displayUrl("example.com")).toBe("example.com");
  });
});

describe("resolveSocialUrl", () => {
  it("expands usernames with the platform prefix", () => {
    expect(resolveSocialUrl("github", "janedoe")).toBe(
      "https://github.com/janedoe",
    );
    expect(resolveSocialUrl("linkedin", "jane-doe")).toBe(
      "https://linkedin.com/in/jane-doe",
    );
    expect(resolveSocialUrl("medium", "@janedoe")).toBe(
      "https://medium.com/@janedoe",
    );
  });

  it("keeps full URLs and bare domains", () => {
    expect(resolveSocialUrl("github", "https://github.com/janedoe")).toBe(
      "https://github.com/janedoe",
    );
    expect(resolveSocialUrl("github", "github.com/janedoe")).toBe(
      "https://github.com/janedoe",
    );
    expect(resolveSocialUrl("custom", "example.com")).toBe(
      "https://example.com",
    );
  });

  it("resolves Mastodon handles to the instance", () => {
    expect(resolveSocialUrl("mastodon", "@jane@example.social")).toBe(
      "https://example.social/@jane",
    );
  });

  it("rejects unsafe schemes", () => {
    expect(resolveSocialUrl("github", "javascript:alert(1)")).toBe("");
  });
});
