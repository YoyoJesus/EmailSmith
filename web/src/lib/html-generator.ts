import { getSocialLabel, type SignatureData } from "./types";
import { getSocialIconDataUri } from "./social-icons";
import {
  displayUrl,
  normalizePhone,
  normalizeUrl,
  resolveSocialUrl,
} from "./links";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function link(href: string, text: string, style: string): string {
  if (!href) return text;
  return `<a target="_blank" href="${escapeHtml(href)}" style="${style}">${text}</a>`;
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
  const hasSocial = socialLinks.some((s) => s.url);
  const hasTitles = titles.some((t) => t.title || t.organization);
  const hasHeader = !!(name || subtitleText || subtitleOrganization);

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
      const href = normalizeUrl(subtitleUrl);
      orgPart = href
        ? link(
            href,
            escapeHtml(subtitleOrganization),
            `color: ${colors.linkColor}; text-decoration: none; font-weight: bold;`,
          )
        : `<strong>${escapeHtml(subtitleOrganization)}</strong>`;
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
        orgPart = link(
          normalizeUrl(t.url),
          escapeHtml(t.organization),
          `color: ${colors.linkColor}; text-decoration: none;`,
        );
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
  const linkStyle = `color: ${colors.linkColor}; text-decoration: none;`;
  const contactParts: string[] = [];
  if (phone) {
    const dial = normalizePhone(phone);
    contactParts.push(
      link(dial && `tel:${dial}`, escapeHtml(phone), linkStyle),
    );
  }
  if (email) {
    contactParts.push(
      link(`mailto:${email.trim()}`, escapeHtml(email), linkStyle),
    );
  }
  if (website) {
    contactParts.push(
      link(normalizeUrl(website), escapeHtml(displayUrl(website)), linkStyle),
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
          const href = resolveSocialUrl(s.platform, s.url);
          if (!href) return "";
          const iconUri = getSocialIconDataUri(s.platform, 18);
          const label = escapeHtml(getSocialLabel(s.platform));
          return `<a target="_blank" href="${escapeHtml(href)}" title="${label}" style="display: inline-block; margin-right: 6px; text-decoration: none;"><img src="${iconUri}" width="18" height="18" alt="${label}" style="display: inline-block; vertical-align: middle;" /></a>`;
        })
        .join("")}</td></tr>`
    : "";

  // Build CTA / action link
  const ctaHref = normalizeUrl(data.ctaUrl);
  const ctaHtml =
    data.ctaText && ctaHref
      ? `<tr><td style="padding-top: 6px;">${link(ctaHref, escapeHtml(data.ctaText), `font-family: ${fonts.fontFamily}; font-size: ${fonts.textSize}px; color: ${colors.accentColor}; text-decoration: none; font-weight: bold;`)}</td></tr>`
      : "";

  // Dividers separate the header, titles, and contact groups wherever two are adjacent.
  const headerDivider =
    hasHeader && (hasTitles || hasContact) ? dividerHtml : "";
  const contactDivider = hasTitles && hasContact ? dividerHtml : "";

  if (layout.layout === "stacked") {
    // Stacked layout: image on top, then info below
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family: ${fonts.fontFamily};">
${signoffHtml}
${hasImage ? `<tr><td style="padding-bottom: 8px;"><img src="${escapeHtml(imgSrc)}" width="${layout.imageSize}" height="${layout.imageSize}" style="border-radius: ${borderRadius}; display: block; object-fit: cover;" alt="Profile photo" /></td></tr>` : ""}
${hasHeader ? `<tr><td><table cellpadding="0" cellspacing="0" border="0">${nameHtml}${subtitleHtml}</table></td></tr>` : ""}
${headerDivider}
${titlesHtml ? `<tr><td><table cellpadding="0" cellspacing="0" border="0">${titlesHtml}</table></td></tr>` : ""}
${contactDivider}
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
${headerDivider}
${titlesHtml}
${contactDivider}
${contactHtml}
${socialHtml}
${ctaHtml}
</table>
</td>
</tr>
</table>`;
}
