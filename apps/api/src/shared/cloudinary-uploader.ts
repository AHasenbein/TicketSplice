import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { HttpError } from "./http-error.js";

let isConfigured = false;

function ensureConfigured() {
  if (isConfigured) {
    return;
  }
  const missing: string[] = [];
  if (!env.CLOUDINARY_CLOUD_NAME) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!env.CLOUDINARY_API_KEY) missing.push("CLOUDINARY_API_KEY");
  if (!env.CLOUDINARY_API_SECRET) missing.push("CLOUDINARY_API_SECRET");
  if (missing.length) {
    throw new HttpError(
      500,
      `Image uploads are not configured. Set ${missing.join(", ")} on the API.`
    );
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true
  });
  isConfigured = true;
}

function extractCloudinaryMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as { message?: unknown; error?: { message?: unknown } };
  if (typeof candidate.message === "string" && candidate.message.length) {
    return candidate.message;
  }
  if (candidate.error && typeof candidate.error.message === "string") {
    return candidate.error.message;
  }
  return undefined;
}

export async function uploadEventImageData(dataUrl: string): Promise<string> {
  ensureConfigured();
  const trimmed = dataUrl.trim();
  if (!/^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(trimmed)) {
    throw new HttpError(400, "Image upload must be a valid base64 image.");
  }

  try {
    const result = await cloudinary.uploader.upload(trimmed, {
      folder: "ticketsplice/events",
      resource_type: "image"
    });
    if (!result.secure_url) {
      throw new Error("Missing secure_url from Cloudinary upload.");
    }
    return result.secure_url;
  } catch (error) {
    const detail = extractCloudinaryMessage(error);
    console.error("[cloudinary] upload failed:", error);
    throw new HttpError(
      502,
      detail ? `Failed to upload event image: ${detail}` : "Failed to upload event image."
    );
  }
}
