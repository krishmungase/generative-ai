import type { PreparedImage } from "./prepare-image";

/** Posts a prepared image to the edit route and returns the edited `data:` URL. */
export async function requestImageEdit(prompt: string, image: PreparedImage) {
  const res = await fetch("/api/edit-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, ...image }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error ?? "Failed to edit image");

  return data.imageUrl as string;
}
