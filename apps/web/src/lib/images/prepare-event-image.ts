/** Matches API `imageDataUrl` max length (2_500_000) with a little headroom. */
const MAX_OUTPUT_LENGTH = 2_400_000;
const MAX_INPUT_BYTES = 12 * 1024 * 1024;
const MAX_DIMENSION = 1920;

export class EventImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventImageError";
  }
}

export async function prepareEventImageUpload(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new EventImageError("Please choose an image file.");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new EventImageError("Image must be 12MB or smaller.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new EventImageError("Could not read image. Try another file.");
  }

  try {
    return encodeBitmapToUploadableJpeg(bitmap);
  } finally {
    bitmap.close();
  }
}

function encodeBitmapToUploadableJpeg(bitmap: ImageBitmap): string {
  let scale =
    bitmap.width > MAX_DIMENSION || bitmap.height > MAX_DIMENSION
      ? MAX_DIMENSION / Math.max(bitmap.width, bitmap.height)
      : 1;
  let quality = 0.88;

  for (let attempt = 0; attempt < 14; attempt++) {
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new EventImageError("Could not process image.");
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);

    if (dataUrl.length <= MAX_OUTPUT_LENGTH) {
      return dataUrl;
    }

    if (quality > 0.5) {
      quality -= 0.1;
      continue;
    }

    scale *= 0.85;
    quality = 0.82;
  }

  throw new EventImageError("Image is still too large after compression. Try a smaller photo.");
}
