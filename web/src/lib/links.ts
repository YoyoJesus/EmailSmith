import { getSocialUrlPrefix } from "./social-icons";
import type { SocialPlatform } from "./types";

const SAFE_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

/**
 * Return an absolute link for user input, adding https:// to bare hosts.
 * Schemes outside http, https, mailto, and tel return "" so they are never emitted.
 */
export function normalizeUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (value.startsWith("//")) return `https:${value}`;
  const scheme = /^([a-z][a-z0-9+.-]*):(.*)$/i.exec(value);
  if (scheme) {
    if (SAFE_SCHEMES.has(scheme[1].toLowerCase())) return value;
    // "example.com:8080/path" is a host with a port, not a scheme.
    if (!/^\d/.test(scheme[2])) return "";
  }
  return `https://${value}`;
}

/** Keep only digits and a leading + so tel: links dial reliably. */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

/** Strip the scheme for display, matching how links are shown in the signature. */
export function displayUrl(raw: string): string {
  return raw.trim().replace(/^https?:\/\//i, "");
}

/**
 * Accept a username or a full URL for a social profile.
 * "janedoe" becomes the platform profile URL; Mastodon handles like "@jane@example.social" resolve to the instance.
 */
export function resolveSocialUrl(
  platform: SocialPlatform,
  raw: string,
): string {
  const value = raw.trim();
  if (!value) return "";
  const mastodon = /^@?([\w.-]+)@([\w-]+(?:\.[\w-]+)+)$/.exec(value);
  if (platform === "mastodon" && mastodon) {
    return `https://${mastodon[2]}/@${mastodon[1]}`;
  }
  const prefix = getSocialUrlPrefix(platform);
  const isHandle = /^@?[\w.-]+$/.test(value) && !/\.[a-z]{2,}$/i.test(value);
  if (prefix && isHandle) {
    return `${prefix}${encodeURIComponent(value.replace(/^@/, ""))}`;
  }
  return normalizeUrl(value);
}
