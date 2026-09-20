/** Error carrying the HTTP status and parsed payload from the API. */
export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/** Thrown when the user is not authenticated and cannot be re-authenticated. */
export class AuthRequiredError extends Error {
  constructor(message = "Not logged in.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

/** Extract a human-readable detail string from a parsed error body. */
export function detailOf(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    const d = p.detail ?? p.error_description ?? p.msg ?? p.message ?? p.error;
    if (typeof d === "string") return d;
  }
  return fallback;
}
