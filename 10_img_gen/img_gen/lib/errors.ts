/** An upstream failure that should reach the client with a specific status. */
export class UpstreamError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Pulls an HTTP status off an UpstreamError or a provider SDK error. */
export function statusOf(err: unknown) {
  if (err instanceof UpstreamError) return err.status;
  const status = (err as { status?: unknown })?.status;
  return typeof status === "number" && status >= 400 && status <= 599
    ? status
    : 500;
}

export function messageOf(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}
