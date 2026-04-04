// 20 mb
export const MAX_FILE_SIZE = 20 * 1024 * 1024

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const

export const MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}