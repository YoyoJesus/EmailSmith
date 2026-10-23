import {
  defaultSignatureData,
  fontFamilies,
  socialPlatforms,
  type ColorSettings,
  type FontSettings,
  type LayoutSettings,
  type SignatureData,
  type SocialLink,
  type SocialPlatform,
  type TitleEntry,
} from "./types";

/** Input bounds shared by the editor controls and saved-data validation. */
export const FONT_SIZE_LIMITS: Record<
  Exclude<keyof FontSettings, "fontFamily">,
  { min: number; max: number }
> = {
  nameSize: { min: 12, max: 30 },
  subtitleSize: { min: 10, max: 24 },
  titleSize: { min: 9, max: 20 },
  textSize: { min: 8, max: 18 },
};
export const IMAGE_SIZE_LIMITS = { min: 40, max: 150 };
export const MAX_TEXT_LENGTH = 500;
export const MAX_LIST_LENGTH = 50;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, fallback: string): string {
  return typeof value === "string" ? value.slice(0, MAX_TEXT_LENGTH) : fallback;
}

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function clampNumber(
  value: unknown,
  { min, max }: { min: number; max: number },
  fallback: number,
): number {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

function hexColor(value: unknown, fallback: string): string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)
    ? value
    : fallback;
}

/** Accept embedded raster images and http(s) URLs; anything else is dropped. */
function imageSource(value: unknown): string {
  if (typeof value !== "string") return "";
  if (/^data:image\/(png|jpeg|gif|webp);base64,[a-z0-9+/=]+$/i.test(value))
    return value;
  if (/^https?:\/\/\S+$/i.test(value) && value.length <= 2048) return value;
  return "";
}

const PLATFORMS = socialPlatforms.map((p) => p.value);
const FONTS = fontFamilies.map((f) => f.value);

function titles(value: unknown): TitleEntry[] {
  if (!Array.isArray(value))
    return structuredClone(defaultSignatureData.titles);
  return value
    .filter(isRecord)
    .slice(0, MAX_LIST_LENGTH)
    .map((t) => ({
      title: text(t.title, ""),
      organization: text(t.organization, ""),
      url: text(t.url, ""),
    }));
}

function socialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .slice(0, MAX_LIST_LENGTH)
    .map((s) => ({
      platform: oneOf<SocialPlatform>(s.platform, PLATFORMS, "custom"),
      url: text(s.url, ""),
    }));
}

function colors(value: unknown): ColorSettings {
  const source = isRecord(value) ? value : {};
  const defaults = defaultSignatureData.colors;
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof ColorSettings)[]) {
    result[key] = hexColor(source[key], defaults[key]);
  }
  return result;
}

function fonts(value: unknown): FontSettings {
  const source = isRecord(value) ? value : {};
  const defaults = defaultSignatureData.fonts;
  const result: FontSettings = {
    ...defaults,
    fontFamily: oneOf(source.fontFamily, FONTS, defaults.fontFamily),
  };
  for (const [key, limits] of Object.entries(FONT_SIZE_LIMITS) as [
    keyof typeof FONT_SIZE_LIMITS,
    { min: number; max: number },
  ][]) {
    result[key] = clampNumber(source[key], limits, defaults[key]);
  }
  return result;
}

function layout(value: unknown): LayoutSettings {
  const source = isRecord(value) ? value : {};
  const defaults = defaultSignatureData.layout;
  return {
    imageSize: clampNumber(
      source.imageSize,
      IMAGE_SIZE_LIMITS,
      defaults.imageSize,
    ),
    imageShape: oneOf(
      source.imageShape,
      ["circle", "square", "rounded"],
      defaults.imageShape,
    ),
    dividerStyle: oneOf(
      source.dividerStyle,
      ["solid", "dashed", "dotted", "none"],
      defaults.dividerStyle,
    ),
    layout: oneOf(source.layout, ["horizontal", "stacked"], defaults.layout),
    showSignoff:
      typeof source.showSignoff === "boolean"
        ? source.showSignoff
        : defaults.showSignoff,
    signoffText: text(source.signoffText, defaults.signoffText),
  };
}

/**
 * Build valid signature data from untrusted input (saved data from older versions, manual edits, partial writes,
 * or imported files). Each field that is missing or has the wrong shape falls back to its default.
 */
export function sanitizeSignatureData(input: unknown): SignatureData {
  const source = isRecord(input) ? input : {};
  const d = defaultSignatureData;
  return {
    name: text(source.name, d.name),
    pronouns: text(source.pronouns, d.pronouns),
    subtitleText: text(source.subtitleText, d.subtitleText),
    subtitleOrganization: text(
      source.subtitleOrganization,
      d.subtitleOrganization,
    ),
    subtitleUrl: text(source.subtitleUrl, d.subtitleUrl),
    profileImage: imageSource(source.profileImage),
    profileImageUrl: text(source.profileImageUrl, d.profileImageUrl),
    titles: titles(source.titles),
    email: text(source.email, d.email),
    phone: text(source.phone, d.phone),
    website: text(source.website, d.website),
    socialLinks: socialLinks(source.socialLinks),
    ctaText: text(source.ctaText, d.ctaText),
    ctaUrl: text(source.ctaUrl, d.ctaUrl),
    colors: colors(source.colors),
    fonts: fonts(source.fonts),
    layout: layout(source.layout),
  };
}
