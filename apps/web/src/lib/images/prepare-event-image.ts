/** Matches API `imageDataUrl` max length (2_500_000) with a little headroom. */
const MAX_OUTPUT_LENGTH = 2_400_000;
const MAX_INPUT_BYTES = 12 * 1024 * 1024;
const MAX_DIMENSION = 1920;

/** Matches event card / carousel framing. */
export const EVENT_IMAGE_ASPECT = 5 / 4;

export class EventImageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventImageError";
  }
}

export interface ImageCropRect {
  /** Left edge in natural image pixels */
  x: number;
  /** Top edge in natural image pixels */
  y: number;
  /** Width in natural image pixels */
  width: number;
  /** Height in natural image pixels */
  height: number;
}

export async function prepareEventImageUpload(file: File): Promise<string> {
  const bitmap = await loadImageBitmapFromFile(file);
  try {
    return encodeBitmapToUploadableJpeg(bitmap);
  } finally {
    bitmap.close();
  }
}

export async function loadImageBitmapFromFile(file: File): Promise<ImageBitmap> {
  if (!file.type.startsWith("image/")) {
    throw new EventImageError("Please choose an image file.");
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new EventImageError("Image must be 12MB or smaller.");
  }

  try {
    return await createImageBitmap(file);
  } catch {
    throw new EventImageError("Could not read image. Try another file.");
  }
}

export async function cropImageFileToUploadableJpeg(
  file: File,
  crop: ImageCropRect
): Promise<string> {
  const bitmap = await loadImageBitmapFromFile(file);
  try {
    return cropBitmapToUploadableJpeg(bitmap, crop);
  } finally {
    bitmap.close();
  }
}

export function cropBitmapToUploadableJpeg(
  bitmap: ImageBitmap,
  crop: ImageCropRect
): string {
  const x = Math.max(0, Math.min(bitmap.width - 1, Math.round(crop.x)));
  const y = Math.max(0, Math.min(bitmap.height - 1, Math.round(crop.y)));
  const width = Math.max(1, Math.min(bitmap.width - x, Math.round(crop.width)));
  const height = Math.max(1, Math.min(bitmap.height - y, Math.round(crop.height)));

  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = width;
  cropCanvas.height = height;
  const cropCtx = cropCanvas.getContext("2d");
  if (!cropCtx) {
    throw new EventImageError("Could not process image.");
  }
  cropCtx.drawImage(bitmap, x, y, width, height, 0, 0, width, height);

  return encodeCanvasToUploadableJpeg(cropCanvas);
}

function encodeBitmapToUploadableJpeg(bitmap: ImageBitmap): string {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new EventImageError("Could not process image.");
  }
  ctx.drawImage(bitmap, 0, 0);
  return encodeCanvasToUploadableJpeg(canvas);
}

function encodeCanvasToUploadableJpeg(source: HTMLCanvasElement): string {
  let scale =
    source.width > MAX_DIMENSION || source.height > MAX_DIMENSION
      ? MAX_DIMENSION / Math.max(source.width, source.height)
      : 1;
  let quality = 0.88;

  for (let attempt = 0; attempt < 14; attempt++) {
    const width = Math.max(1, Math.round(source.width * scale));
    const height = Math.max(1, Math.round(source.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new EventImageError("Could not process image.");
    }
    ctx.drawImage(source, 0, 0, width, height);
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
