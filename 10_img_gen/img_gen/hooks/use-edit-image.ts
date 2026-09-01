"use client";

import { useIsMutating, useMutation } from "@tanstack/react-query";
import { requestImageEdit } from "@/lib/edit-image-request";
import { prepareImage } from "@/lib/prepare-image";
import { useCurrentImageUrl, useEditorStore } from "@/store";

const EDIT_IMAGE_KEY = ["edit-image"] as const;

/** Runs one image edit and swaps the result into the editor. */
export function useEditImage() {
  const imageUrl = useCurrentImageUrl();
  const addImage = useEditorStore((s) => s.addImage);

  return useMutation({
    mutationKey: EDIT_IMAGE_KEY,
    mutationFn: async (prompt: string) => {
      if (!prompt.trim() || !imageUrl) {
        throw new Error("An image and a prompt are required");
      }

      const prepared = await prepareImage(imageUrl);
      return requestImageEdit(prompt, prepared);
    },
    onSuccess: (nextImageUrl) => {
      addImage(nextImageUrl);
    },
  });
}

/** Read-only edit status for components that don't trigger the edit. */
export function useIsEditingImage() {
  return useIsMutating({ mutationKey: EDIT_IMAGE_KEY }) > 0;
}
