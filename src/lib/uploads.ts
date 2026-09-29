export const UPLOAD_BUCKET = "uploads";
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/** Checks that a storage path is a single photo inside the user's own folder. */
export function isOwnUploadPath(path: string, userId: string): boolean {
  const match = /^([0-9a-f-]{36})\/[0-9a-f-]{36}\.(jpg|png|webp)$/.exec(path);
  return match !== null && match[1] === userId;
}

export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!ALLOWED_IMAGE_TYPES[file.type]) return "Please upload a JPG, PNG or WebP photo.";
  if (file.size > MAX_UPLOAD_BYTES) return "Photos must be 10 MB or smaller.";
  return null;
}
