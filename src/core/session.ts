import fs from "node:fs";
import { PATHS, readJson, writeJson, fileExists } from "./paths.js";
import { passwordGrant, refreshGrant, fetchMe, jwtExpiryMs } from "./auth.js";
import { loadCredentials } from "./config.js";
import { AuthRequiredError } from "./errors.js";
import { log } from "./ui.js";
import type { Session, TokenGrant, UserProfile } from "../types.js";

/** Refresh the access token this many ms before it actually expires. */
const REFRESH_SKEW_MS = 60_000;

export function loadSession(): Session | null {
  if (!fileExists(PATHS.session)) return null;
  return readJson<Session | null>(PATHS.session, null);
}

export function saveSession(grant: TokenGrant, user: UserProfile): Session {
  const session: Session = {
    accessToken: grant.access_token,
    refreshToken: grant.refresh_token,
    expiresAt: safeExpiry(grant),
    user,
    savedAt: new Date().toISOString(),
  };
  writeJson(PATHS.session, session);
  return session;
}

function safeExpiry(grant: TokenGrant): number {
  try {
    return jwtExpiryMs(grant.access_token);
  } catch {
    return Date.now() + (grant.expires_in ?? 3600) * 1000;
  }
}

export function clearSession(): void {
  if (fileExists(PATHS.session)) fs.rmSync(PATHS.session);
}

/** Full login with email + password. Persists the session. */
export async function login(email: string, password: string): Promise<Session> {
  const grant = await passwordGrant(email, password);
  const user = await fetchMe(grant.access_token);
  return saveSession(grant, user);
}

/** Attempt a silent re-login using the stored credentials file / env vars. */
async function relogin(): Promise<Session | null> {
  const creds = loadCredentials();
  if (!creds) return null;
  try {
    log.debug("Access + refresh token expired — re-authenticating from credentials file.");
    return await login(creds.email, creds.password);
  } catch (e) {
    log.debug(`Silent re-login failed: ${(e as Error).message}`);
    return null;
  }
}

/**
 * Return a valid access token, transparently refreshing (or re-logging-in) as
 * needed. This is what makes "log in once" work long-term.
 */
export async function getValidAccessToken(): Promise<string> {
  let session = loadSession();

  if (!session) {
    const relogged = await relogin();
    if (relogged) return relogged.accessToken;
    throw new AuthRequiredError();
  }

  if (Date.now() < session.expiresAt - REFRESH_SKEW_MS) {
    return session.accessToken;
  }

  // Token is (near) expired — rotate it with the refresh token.
  try {
    const grant = await refreshGrant(session.refreshToken);
    // Supabase may not re-send the profile; keep the cached one.
    session = saveSession(grant, session.user);
    return session.accessToken;
  } catch {
    const relogged = await relogin();
    if (relogged) return relogged.accessToken;
    throw new AuthRequiredError(
      "Session expired and could not be refreshed. Run `uno login` again."
    );
  }
}

/** Refresh the cached user profile from the server. */
export async function refreshProfile(): Promise<UserProfile> {
  const token = await getValidAccessToken();
  const user = await fetchMe(token);
  const session = loadSession();
  if (session) {
    session.user = user;
    writeJson(PATHS.session, session);
  }
  return user;
}
