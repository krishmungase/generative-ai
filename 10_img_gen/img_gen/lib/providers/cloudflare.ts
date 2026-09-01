import { UpstreamError } from "@/lib/errors";
import { detectImageMime } from "@/lib/image";
import type { EditRequest, ImageProvider } from "./types";

const MODEL =
  process.env.CLOUDFLARE_IMAGE_MODEL ?? "@cf/black-forest-labs/flux-2-klein-4b";

type WorkersAiResponse = {
  result?: { image?: string };
  errors?: Array<{ message?: string }>;
};

function endpoint(accountId: string) {
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`;
}

/** Input images must be named `input_image_0`..`input_image_3`. */
function buildForm({ prompt, image, width, height }: EditRequest) {
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("width", String(width));
  form.append("height", String(height));
  form.append(
    "input_image_0",
    new Blob([Buffer.from(image.data, "base64")], { type: image.mimeType }),
    "input",
  );
  return form;
}

function readError(payload: WorkersAiResponse | null, status: number) {
  const detail = payload?.errors
    ?.map((e) => e.message)
    .filter(Boolean)
    .join("; ");
  return detail || `Workers AI returned ${status}`;
}

/**
 * FLUX.2 [klein] takes multipart form data even for a plain prompt, and returns
 * the result as a base64 string. Input images must be smaller than 512x512.
 */
export const cloudflare: ImageProvider = {
  name: "cloudflare",
  quotaMessage:
    "Daily free quota exhausted. Workers AI resets its free neuron allowance every day.",

  async edit(request) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      throw new UpstreamError(
        "CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be set",
        500,
      );
    }

    // Content-Type is left unset so fetch adds the multipart boundary.
    const res = await fetch(endpoint(accountId), {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}` },
      body: buildForm(request),
    });

    const payload: WorkersAiResponse | null = await res.json().catch(() => null);
    const image = payload?.result?.image;

    if (!res.ok || !image) {
      throw new UpstreamError(
        readError(payload, res.status),
        res.ok ? 502 : res.status,
      );
    }

    return `data:${detectImageMime(image)};base64,${image}`;
  },
};
