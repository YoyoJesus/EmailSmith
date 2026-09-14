export interface TitleEntry {
  title: string;
  organization: string;
  url: string;
}

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export type SocialPlatform =
  | "linkedin"
  | "github"
  | "twitter"
  | "instagram"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "discord"
  | "mastodon"
  | "bluesky"
  | "reddit"
  | "stackoverflow"
  | "dribbble"
  | "behance"
  | "medium"
  | "custom";

export interface ColorSettings {
  nameColor: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  linkColor: string;
  dividerColor: string;
}

export interface FontSettings {
  fontFamily: string;
  nameSize: number;
  subtitleSize: number;
  titleSize: number;
  textSize: number;
}

export interface LayoutSettings {
  imageSize: number;
  imageShape: "circle" | "square" | "rounded";
  dividerStyle: "solid" | "dashed" | "dotted" | "none";
  layout: "horizontal" | "stacked";
  showSignoff: boolean;
  signoffText: string;
}

export interface SignatureData {
  name: string;
  pronouns: string;
  subtitleText: string;
  subtitleOrganization: string;
  subtitleUrl: string;
  profileImage: string; // base64 data URL or external URL
  profileImageUrl: string; // external URL for email HTML
  titles: TitleEntry[];
  email: string;
  phone: string;
  website: string;
  socialLinks: SocialLink[];
  ctaText: string;
  ctaUrl: string;
  colors: ColorSettings;
  fonts: FontSettings;
  layout: LayoutSettings;
}

export const defaultSignatureData: SignatureData = {
  name: "",
  pronouns: "",
  subtitleText: "",
  subtitleOrganization: "",
  subtitleUrl: "",
  profileImage: "",
  profileImageUrl: "",
  titles: [{ title: "", organization: "", url: "" }],
  email: "",
  phone: "",
  website: "",
  socialLinks: [],
  ctaText: "",
  ctaUrl: "",
  colors: {
    nameColor: "#1a1a2e",
    titleColor: "#333333",
    textColor: "#555555",
    accentColor: "#2563eb",
    linkColor: "#2563eb",
    dividerColor: "#d1d5db",
  },
  fonts: {
    fontFamily: "Arial, Helvetica, sans-serif",
    nameSize: 18,
    subtitleSize: 15,
    titleSize: 13,
    textSize: 12,
  },
  layout: {
    imageSize: 80,
    imageShape: "circle",
    dividerStyle: "solid",
    layout: "horizontal",
    showSignoff: false,
    signoffText: "Best regards,",
  },
};

export const fontFamilies: { label: string; value: string }[] = [
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Tahoma", value: "Tahoma, Geneva, sans-serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
];

export const socialPlatforms: { value: SocialPlatform; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "twitter", label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "discord", label: "Discord" },
  { value: "mastodon", label: "Mastodon" },
  { value: "bluesky", label: "Bluesky" },
  { value: "reddit", label: "Reddit" },
  { value: "stackoverflow", label: "Stack Overflow" },
  { value: "dribbble", label: "Dribbble" },
  { value: "behance", label: "Behance" },
  { value: "medium", label: "Medium" },
  { value: "custom", label: "Custom" },
];
