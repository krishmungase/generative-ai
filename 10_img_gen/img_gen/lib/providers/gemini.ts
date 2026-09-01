import { GoogleGenAI } from "@google/genai";
import { UpstreamError } from "@/lib/errors";
import { toDataUrl } from "@/lib/image";
import type { ImageProvider } from "./types";

const MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3.1-flash-image";

export const gemini: ImageProvider = {
  name: "gemini",
  quotaMessage:
    "Image generation is not available on this API key's plan. Enable billing at https://aistudio.google.com/apikey.",

  async edit({ prompt, image }) {
    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
      throw new UpstreamError("GEMINI_API_KEY is not configured", 500);
    }

    const interaction = await new GoogleGenAI({}).interactions.create({
      model: MODEL,
      input: [
        { type: "text", text: prompt },
        { type: "image", mime_type: image.mimeType, data: image.data },
      ],
    });

    const output = interaction.output_image;

    if (!output?.data) {
      throw new UpstreamError(
        interaction.output_text?.trim() || "The model did not return an image",
        502,
      );
    }

    return toDataUrl({
      mimeType: output.mime_type ?? "image/png",
      data: output.data,
    });
  },
};
