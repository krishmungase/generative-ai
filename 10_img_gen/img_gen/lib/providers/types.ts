import type { ImagePayload } from "@/lib/image";

export type EditRequest = {
  prompt: string;
  image: ImagePayload;
  width: number;
  height: number;
};

export type ImageProvider = {
  name: string;
  /** Resolves to a `data:` URL of the edited image. */
  edit(request: EditRequest): Promise<string>;
  /** Shown to the user when the provider answers 429. */
  quotaMessage: string;
};
