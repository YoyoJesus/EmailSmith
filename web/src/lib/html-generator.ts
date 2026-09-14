import type { SignatureData } from "./types";
import { getSocialIconDataUri, getSocialColor } from "./social-icons";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateSignatureHtml(data: SignatureData): string {
  const {
    name,
    pronouns,
    subtitleText,
    subtitleOrganization,
    subtitleUrl,
    titles,
    email,
    phone,
    website,
    socialLinks,
    colors,
    fonts,
    layout,
  } = data;
  const imgSrc = data.profileImageUrl || data.profileImage;
  const hasImage = !!imgSrc;
  const hasContact = !!(email || phone || website);
  const hasSocial = socialLinks.length > 0 && socialLinks.some((s) => s.url);
  const hasTitles = titles.some((t) => t.title || t.organization);

  const borderRadius =
    layout.imageShape === "circle"
      ? "50%"
      : layout.imageShape === "rounded"
        ? "8px"
        : "0";

  const dividerHtml =
    layout.dividerStyle !== "none"
      ? `<tr><td style="padding: 6px 0;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="border-top: 1px ${layout.dividerStyle} ${colors.dividerColor}; font-size: 1px; line-height: 1px;">&nbsp;</td></tr></table></td></tr>`
      : "";

  // Build signoff
  let signoffHtml = "";
  if (layout.showSignoff && layout.signoffText) {
    signoffHtml = `<tr><td style="font-family: ${fonts.fontFamily}; font-size: ${fonts.textSize}px; color: ${colors.textColor}; padding-bottom: 8px;">${escapeHtml(layout.signoffText)}</td></tr>`;
  }

  // Build image cell
  const imageHtml = hasImage
    ? `<td style="vertical-align: top; padding-right: 16px;" rowspan="2"><img src="${escapeHtml(imgSrc)}" width="${layout.imageSize}" height="${layout.imageSize}" style="border-radius: ${borderRadius}; display: block; object-fit: cover;" alt="Profile photo" /></td>`
    : "";

  // Build name
  const pronounsSpan = pronouns
    ? ` <span style="font-size: ${fonts.textSize}px; color: ${colors.textColor}; font-weight: normal;">(${escapeHtml(pronouns)})</span>`
    : "";
  const nameHtml = name
    ? `<tr><td style="font-family: ${fonts.fontFamily}; font-size: ${fonts.nameSize}px; font-weight: bold; color: ${colors.nameColor}; padding-bottom: 2px; white-space: nowrap;">${escapeHtml(name)}${pronounsSpan}</td></tr>`
    : "";

  // Build subtitle
  let subtitleContent = "";
  if (subtitleText || subtitleOrganization) {
    let orgPart = "";
    if (subtitleOrganization) {
      const orgBold = `<strong>${escapeHtml(subtitleOrganization)}</strong>`;
      if (subtitleUrl) {
        const href = subtitleUrl.startsWith("http")
          ? subtitleUrl
          : `https://${subtitleUrl}`;
        orgPart = `<a target="_blank" href="${escapeHtml(href)}" style="color: ${colors.linkColor}; text-decoration: none; font-weight: bold;">${escapeHtml(subtitleOrganization)}</a>`;
      } else {
        orgPart = orgBold;
      }
    }
    const parts = [
      subtitleText ? escapeHtml(subtitleText) : "",
      orgPart,
    ].filter(Boolean);
    subtitleContent = parts.join(", ");
  }
  const subtitleHtml = subtitleContent
    ? `<tr><td style="font-family: ${fonts.fontFamily}; font-size: ${fonts.subtitleSize}px; color: ${colors.titleColor}; padding-bottom: 2px;">${subtitleContent}</td></tr>`
    : "";

  // Build titles
  const titlesHtml = titles
    .filter((t) => t.title || t.organization)
    .map((t) => {
      let titlePart = t.title ? `<strong>${escapeHtml(t.title)}</strong>` : "";
      let orgPart = "";
      if (t.organization) {
        const orgText = escapeHtml(t.organization);
        if (t.url) {
          const href = t.url.startsWith("http") ? t.url : `https://${t.url}`;
          orgPart = `<a target="_blank" href="${escapeHtml(href)}" style="color: ${colors.linkColor}; text-decoration: none;">${orgText}</a>`;
        } else {
          orgPart = orgText;
        }
      }
      let text = "";
      if (titlePart && orgPart) {
        text = `${titlePart}, ${orgPart}`;
      } else {
        text = titlePart || orgPart;
      }
      return `<tr><td style="font-family: ${fonts.fontFamily}; font-size: ${fonts.titleSize}px; color: ${colors.titleColor}; padding-bottom: 2px;">${text}</td></tr>`;
    })
    .join("\n");

  // Build contact info
  const contactParts: string[] = [];
  if (phone) {
    contactParts.push(
      `<a target="_blank" href="tel:${escapeHtml(phone)}" style="color: ${colors.linkColor}; text-decoration: none;">${escapeHtml(phone)}</a>`,
    );
  }
  if (email) {
    contactParts.push(
      `<a target="_blank" href="mailto:${escapeHtml(email)}" style="color: ${colors.linkColor}; text-decoration: none;">${escapeHtml(email)}</a>`,
    );
  }
  if (website) {
    const href = website.startsWith("http") ? website : `https://${website}`;
    const display = website.replace(/^https?:\/\//, "");
    contactParts.push(
      `<a target="_blank" href="${escapeHtml(href)}" style="color: ${colors.linkColor}; text-decoration: none;">${escapeHtml(display)}</a>`,
    );
  }
  const contactHtml =
    contactParts.length > 0
      ? `<tr><td style="font-family: ${fonts.fontFamily}; font-size: ${fonts.textSize}px; color: ${colors.textColor}; padding-bottom: 4px;">${contactParts.join(" &nbsp;|&nbsp; ")}</td></tr>`
      : "";

  // Build social links
  const socialHtml = hasSocial
    ? `<tr><td style="padding-top: 4px;">${socialLinks
        .filter((s) => s.url)
        .map((s) => {
          const iconUri = getSocialIconDataUri(s.platform, 18);
          const href = s.url.startsWith("http") ? s.url : `https://${s.url}`;
          return `<a target="_blank" href="${escapeHtml(href)}" style="display: inline-block; margin-right: 6px; text-decoration: none;"><img src="${iconUri}" width="18" height="18" alt="${s.platform}" style="display: inline-block; vertical-align: middle;" /></a>`;
        })
        .join("")}</td></tr>`
    : "";

  // Build CTA / action link
  const ctaHtml =
    data.ctaText && data.ctaUrl
      ? `<tr><td style="padding-top: 6px;"><a target="_blank" href="${escapeHtml(data.ctaUrl.startsWith("http") ? data.ctaUrl : `https://${data.ctaUrl}`)}" style="font-family: ${fonts.fontFamily}; font-size: ${fonts.textSize}px; color: ${colors.linkColor}; text-decoration: none; font-weight: bold;">${escapeHtml(data.ctaText)}</a></td></tr>`
      : "";

  if (layout.layout === "stacked") {
    // Stacked layout: image on top, then info below
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: ${fonts.fontFamily};">
${signoffHtml}
${hasImage ? `<tr><td style="padding-bottom: 8px;"><img src="${escapeHtml(imgSrc)}" width="${layout.imageSize}" height="${layout.imageSize}" style="border-radius: ${borderRadius}; display: block; object-fit: cover;" alt="Profile photo" /></td></tr>` : ""}
${nameHtml ? `<tr><td><table cellpadding="0" cellspacing="0" border="0">${nameHtml}${subtitleHtml}</table></td></tr>` : ""}
${hasTitles || hasContact ? dividerHtml : ""}
${titlesHtml ? `<tr><td><table cellpadding="0" cellspacing="0" border="0">${titlesHtml}</table></td></tr>` : ""}
${hasContact ? `<tr><td><table cellpadding="0" cellspacing="0" border="0">${contactHtml}</table></td></tr>` : ""}
${socialHtml ? `<tr><td><table cellpadding="0" cellspacing="0" border="0">${socialHtml}</table></td></tr>` : ""}
${ctaHtml ? `<tr><td><table cellpadding="0" cellspacing="0" border="0">${ctaHtml}</table></td></tr>` : ""}
</table>`;
  }

  // Horizontal layout: image left, info right
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: ${fonts.fontFamily};">
${signoffHtml}
<tr>
${imageHtml}
<td style="vertical-align: top;">
<table cellpadding="0" cellspacing="0" border="0">
${nameHtml}
${subtitleHtml}
${(hasTitles || subtitleHtml) && nameHtml ? dividerHtml : ""}
${titlesHtml}
${hasContact && (hasTitles || nameHtml) ? dividerHtml : ""}
${contactHtml}
${socialHtml}
${ctaHtml}
</table>
</td>
</tr>
</table>`;
}
