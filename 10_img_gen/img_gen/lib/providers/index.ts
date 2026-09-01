import { UpstreamError } from "@/lib/errors";
import { cloudflare } from "./cloudflare";
import { gemini } from "./gemini";
import type { ImageProvider } from "./types";

const PROVIDERS: Record<string, ImageProvider> = { cloudflare, gemini };

export function getProvider(): ImageProvider {
  const name = (process.env.IMAGE_PROVIDER ?? cloudflare.name).toLowerCase();
  const provider = PROVIDERS[name];

  if (!provider) {
    throw new UpstreamError(
      `Unknown IMAGE_PROVIDER "${name}". Expected one of: ${Object.keys(PROVIDERS).join(", ")}.`,
      500,
    );
  }

  return provider;
}

export type { EditRequest, ImageProvider } from "./types";
