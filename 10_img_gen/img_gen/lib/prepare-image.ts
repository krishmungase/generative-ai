/** Workers AI requires input images smaller than 512x512. */
const MAX_INPUT_EDGE = 504;
/** The model accepts 256-1920 per side; keep the output reasonable for the canvas. */
const MAX_OUTPUT_EDGE = 1024;

export type PreparedImage = {
  image: string;
  width: number;
  height: number;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image"));
    img.src = src;
  });
}

/** Diffusion models expect dimensions on a 16px grid. */
const toGrid = (value: number) =>
  Math.min(1920, Math.max(256, Math.round(value / 16) * 16));

function resize(img: HTMLImageElement, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser");

  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

/**
 * Shrinks the source below the upstream input limit and works out an output size
 * that preserves the original aspect ratio.
 */
export async function prepareImage(dataUrl: string): Promise<PreparedImage> {
  const img = await loadImage(dataUrl);
  const scale = Math.min(
    1,
    MAX_OUTPUT_EDGE / Math.max(img.naturalWidth, img.naturalHeight),
  );

  return {
    image: resize(img, MAX_INPUT_EDGE).toDataURL("image/png"),
    width: toGrid(img.naturalWidth * scale),
    height: toGrid(img.naturalHeight * scale),
  };
}
