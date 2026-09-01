import { NextResponse } from "next/server";
import { parseDataUrl } from "@/lib/image";
import { getProvider } from "@/lib/providers";
import { messageOf, statusOf } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 60;

const clampEdge = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(1920, Math.max(256, Math.round(value)))
    : fallback;

const fail = (error: string, status: number) =>
  NextResponse.json({ error }, { status });

const readJson = (req: Request) =>
  req.json().catch(() => null) as Promise<Record<string, unknown> | null>;

export async function POST(req: Request) {
  const body = await readJson(req);
  if (!body) return fail("Invalid JSON body", 400);

  const { image, prompt } = body;

  if (typeof image !== "string" || !image.trim())
    return fail("An image is required", 400);

  if (typeof prompt !== "string" || !prompt.trim())
    return fail("A prompt is required", 400);

  const provider = getProvider();

  try {
    const imageUrl = await provider.edit({
      prompt,
      image: parseDataUrl(image),
      width: clampEdge(body.width, 1024),
      height: clampEdge(body.height, 768),
    });

    return NextResponse.json({ imageUrl });
  } catch (err) {
    const status = statusOf(err);
    console.error(`edit-image failed (${provider.name}, ${status}):`, err);

    return status === 429
      ? fail(provider.quotaMessage, 429)
      : fail(messageOf(err, "Failed to edit image"), status);
  }
}
