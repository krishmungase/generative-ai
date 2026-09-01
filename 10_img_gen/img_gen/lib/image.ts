export type ImagePayload = {
  mimeType: string;
  data: string;
};

const DATA_URL = /^data:(image\/[a-z+.-]+);base64,(.+)$/i;

/** Accepts a `data:` URL or a bare base64 string. */
export function parseDataUrl(image: string): ImagePayload {
  const match = DATA_URL.exec(image.trim());
  return match
    ? { mimeType: match[1], data: match[2] }
    : { mimeType: "image/png", data: image.trim() };
}

export function toDataUrl({ mimeType, data }: ImagePayload) {
  return `data:${mimeType};base64,${data}`;
}

/**
 * Workers AI documents its output only as "base64 string" and actually returns
 * JPEG, so sniff the magic bytes rather than trusting a format.
 */
export function detectImageMime(base64: string) {
  if (base64.startsWith("/9j/")) return "image/jpeg";
  if (base64.startsWith("iVBORw0KGgo")) return "image/png";
  if (base64.startsWith("UklGR")) return "image/webp";
  return "image/png";
}
