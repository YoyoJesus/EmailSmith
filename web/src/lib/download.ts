export type DownloadKind = "html" | "typst" | "png";

/** Turn a signature name into a safe file name stem. */
export function fileStem(name: string): string {
  return (
    name
      .normalize("NFKD")
      .replace(/[^\w.-]+/g, "-")
      .replace(/^[-.]+|[-.]+$/g, "")
      .slice(0, 60) || "signature"
  );
}

/** A standalone HTML document for clients such as Thunderbird that attach a signature from a file. */
export function htmlDocument(signatureHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Email signature</title>
</head>
<body>
${signatureHtml}
</body>
</html>
`;
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/**
 * Render signature HTML to a PNG by drawing it into an SVG foreignObject. SVG images cannot load external
 * resources, so remote images (such as a hosted profile photo) are left blank; pass HTML with embedded images.
 */
export async function renderPng(html: string, scale = 2): Promise<Blob> {
  const host = document.createElement("div");
  host.style.cssText =
    "position: fixed; left: -10000px; top: 0; display: inline-block; padding: 12px; background: #ffffff;";
  host.innerHTML = html;
  document.body.appendChild(host);
  const width = Math.ceil(host.offsetWidth);
  const height = Math.ceil(host.offsetHeight);
  host.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  host.style.cssText =
    "display: inline-block; padding: 12px; background: #ffffff;";
  const xhtml = new XMLSerializer().serializeToString(host);
  document.body.removeChild(host);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${xhtml}</foreignObject></svg>`;
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");
  context.scale(scale, scale);
  context.drawImage(image, 0, 0);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))),
      "image/png",
    ),
  );
}
