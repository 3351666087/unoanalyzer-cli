import { getConfig, apiBase } from "./config.js";
import { ApiError, detailOf } from "./errors.js";
import type { TokenGrant, UserProfile } from "../types.js";

/** Parse the exp claim (ms) out of a Supabase access-token JWT. */
export function jwtExpiryMs(accessToken: string): number {
  const parts = accessToken.split(".");
  if (parts.length !== 3) throw new Error("Malformed access token (not a JWT).");
  const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const claims = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  if (typeof claims.exp !== "number") throw new Error("Access token has no exp claim.");
  return claims.exp * 1000;
}

async function grant(
  grantType: "password" | "refresh_token",
  body: Record<string, string>
): Promise<TokenGrant> {
  const cfg = getConfig();
  const url = `${cfg.supabaseUrl.replace(/\/$/, "")}/auth/v1/token?grant_type=${grantType}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: cfg.supabasePublishableKey,
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new ApiError(0, `Auth network error: ${(e as Error).message}`);
  }
  const text = await res.text();
  let json: unknown = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { detail: text };
  }
  if (!res.ok) {
    throw new ApiError(res.status, detailOf(json, `Auth failed (HTTP ${res.status})`), json);
  }
  return json as TokenGrant;
}

export function passwordGrant(email: string, password: string): Promise<TokenGrant> {
  return grant("password", { email, password });
}

export function refreshGrant(refreshToken: string): Promise<TokenGrant> {
  return grant("refresh_token", { refresh_token: refreshToken });
}

/** Fetch the current user's profile from /api/cn/me. */
export async function fetchMe(accessToken: string): Promise<UserProfile> {
  const res = await fetch(`${apiBase()}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new ApiError(res.status, detailOf(json, `Failed to load profile (HTTP ${res.status})`), json);
  }
  return json as UserProfile;
}
