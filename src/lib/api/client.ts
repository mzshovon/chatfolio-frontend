/**
 * Every endpoint in this API returns `{"detail": "..."}` on error and never a
 * machine-readable error code — callers must branch on `status`, not on `detail`.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly detail?: string;

  constructor(status: number, detail?: string) {
    super(detail || `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

export async function parseErrorDetail(res: Response): Promise<string | undefined> {
  try {
    const body: unknown = await res.json();
    if (body && typeof body === "object" && "detail" in body) {
      const detail = (body as { detail?: unknown }).detail;
      if (typeof detail === "string") return detail;
    }
  } catch {
    // No JSON body — nothing to extract.
  }
  return undefined;
}

export async function assertOk(res: Response): Promise<void> {
  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorDetail(res));
  }
}
