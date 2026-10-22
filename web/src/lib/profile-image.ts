import { IMAGE_SIZE_LIMITS } from "./signature-schema";

/** Twice the largest display size, so the photo stays sharp on high-density screens. */
export const PROFILE_IMAGE_PIXELS = IMAGE_SIZE_LIMITS.max * 2;
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/** Centered square crop, matching how the signature displays the photo. */
export function squareCrop(
  width: number,
  height: number,
): { x: number; y: number; size: number } {
  const size = Math.min(width, height);
  return {
    x: Math.round((width - size) / 2),
    y: Math.round((height - size) / 2),
    size,
  };
}

/**
 * Crop to a square, downscale to PROFILE_IMAGE_PIXELS, and encode as JPEG so the data URL fits in localStorage.
 * JPEG has no transparency, so transparent areas are filled with white.
 */
export async function resizeProfileImage(
  file: Blob,
  pixels = PROFILE_IMAGE_PIXELS,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const crop = squareCrop(bitmap.width, bitmap.height);
    const size = Math.min(pixels, crop.size);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not available");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size, size);
    context.imageSmoothingQuality = "high";
    context.drawImage(
      bitmap,
      crop.x,
      crop.y,
      crop.size,
      crop.size,
      0,
      0,
      size,
      size,
    );
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    bitmap.close();
  }
}
