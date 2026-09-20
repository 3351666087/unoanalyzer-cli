import { getConfig, apiBase } from "./config.js";
import { getValidAccessToken } from "./session.js";
import { ApiError, detailOf } from "./errors.js";
import { log } from "./ui.js";

export interface RequestOptions {
  method?: string;
  /** JSON body (ignored when `form` is set). */
  body?: unknown;
  /** multipart/form-data body. */
  form?: FormData;
  /** Extra query params. */
  query?: Record<string, string | number | undefined>;
  /** Skip auth header (rarely needed). */
  anonymous?: boolean;
}

/**
 * Resolve a caller path into an absolute URL.
 *  - "http..."          → used as-is
 *  - "/api/..."         → backendUrl + path (manifest paths use this form)
 *  - "/courses/x"       → apiBase() + path  (curated commands use this form)
 */
export function resolveUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const cfg = getConfig();
  if (path.startsWith("/api/")) return cfg.backendUrl.replace(/\/$/, "") + path;
  return apiBase() + (path.startsWith("/") ? path : "/" + path);
}

async function request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const method = (opts.method ?? "GET").toUpperCase();
  let url = resolveUrl(path);

  if (opts.query) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    }
    const q = qs.toString();
    if (q) url += (url.includes("?") ? "&" : "?") + q;
  }

  const headers: Record<string, string> = {};
  if (!opts.anonymous) headers.Authorization = `Bearer ${await getValidAccessToken()}`;

  let payload: string | FormData | undefined;
  if (opts.form) {
    payload = opts.form; // fetch sets the multipart boundary automatically
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(opts.body);
  }

  log.debug(`${method} ${url}`);
  let res: Response;
  try {
    res = await fetch(url, { method, headers, body: payload });
  } catch (e) {
    throw new ApiError(0, `Network error: ${(e as Error).message}`);
  }

  const text = await res.text();
  let json: unknown = undefined;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, detailOf(json, `HTTP ${res.status} for ${method} ${path}`), json);
  }
  return json as T;
}

export const api = {
  request,
  get: <T = unknown>(path: string, query?: RequestOptions["query"]) =>
    request<T>(path, { method: "GET", query }),
  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  put: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "PUT", body }),
  patch: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  del: <T = unknown>(path: string, query?: RequestOptions["query"]) =>
    request<T>(path, { method: "DELETE", query }),
  upload: <T = unknown>(path: string, form: FormData, method = "POST") =>
    request<T>(path, { method, form }),
};
