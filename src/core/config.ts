import fs from "node:fs";
import { PATHS, readJson, writeJson, fileExists } from "./paths.js";

/**
 * Platform configuration. The bundled defaults were discovered from the live
 * SPA on 2026-09-20 and are refreshed automatically by `uno sync`, so the tool
 * keeps working even if the platform rotates its Supabase key or moves hosts.
 */
export interface PlatformConfig {
  /** Base of the SPA used for endpoint discovery, e.g. https://cn.unoanalyzer.com/app/ */
  appUrl: string;
  /** Backend origin that serves /api/cn/* */
  backendUrl: string;
  /** Supabase auth origin (auth/v1/token). Same host as backend on cn. */
  supabaseUrl: string;
  /** Supabase publishable (anon) key — a public client key, safe to ship. */
  supabasePublishableKey: string;
  /** API prefix for the active region. cn → /api/cn */
  apiPrefix: string;
  /** Fully automatic manifest sync when the platform bundle changes. */
  autoSync: boolean;
  /** Minimum seconds between staleness checks so we don't hit the network every run. */
  syncCheckIntervalSec: number;
  /** Epoch ms of the last staleness check (internal bookkeeping). */
  lastCheckAt?: number;
}

export const DEFAULT_CONFIG: PlatformConfig = {
  appUrl: "https://cn.unoanalyzer.com/app/",
  backendUrl: "https://cn.unoanalyzer.com",
  supabaseUrl: "https://cn.unoanalyzer.com",
  supabasePublishableKey: "sb_publishable_BMWm1NOV4Mj8NoeLumuj1Y_0lbGpvBn",
  apiPrefix: "/api/cn",
  autoSync: true,
  syncCheckIntervalSec: 3600,
};

let cached: PlatformConfig | null = null;

export function getConfig(): PlatformConfig {
  if (cached) return cached;
  const stored = readJson<Partial<PlatformConfig>>(PATHS.config, {});
  cached = { ...DEFAULT_CONFIG, ...stored };
  // Environment overrides (useful for testing against a staging host).
  if (process.env.UNO_BACKEND_URL) cached.backendUrl = process.env.UNO_BACKEND_URL;
  if (process.env.UNO_APP_URL) cached.appUrl = process.env.UNO_APP_URL;
  return cached;
}

export function saveConfig(patch: Partial<PlatformConfig>): PlatformConfig {
  const merged = { ...getConfig(), ...patch };
  writeJson(PATHS.config, merged);
  cached = merged;
  return merged;
}

/** The active API base, e.g. https://cn.unoanalyzer.com/api/cn */
export function apiBase(): string {
  const cfg = getConfig();
  return cfg.backendUrl.replace(/\/$/, "") + cfg.apiPrefix;
}

// ---------------------------------------------------------------------------
// Credentials file
// ---------------------------------------------------------------------------

export interface Credentials {
  email: string;
  password: string;
}

const CREDENTIALS_TEMPLATE = {
  _comment: [
    "UnoAnalyzer CLI credentials. Fill in your platform email and password below,",
    "then run:  uno login",
    "This file is stored with 0600 permissions and is never uploaded anywhere",
    "except the official Supabase auth endpoint to obtain a session token.",
    "It is git-ignored. Delete it any time; you can also use the env vars",
    "UNO_EMAIL / UNO_PASSWORD instead of this file.",
  ],
  email: "",
  password: "",
};

/** Create the credentials template on first run and return its path. */
export function scaffoldCredentials(): string {
  if (!fileExists(PATHS.credentials)) {
    writeJson(PATHS.credentials, CREDENTIALS_TEMPLATE);
    fs.chmodSync(PATHS.credentials, 0o600);
  }
  return PATHS.credentials;
}

/** Load credentials from env vars (preferred for CI) or the credentials file. */
export function loadCredentials(): Credentials | null {
  if (process.env.UNO_EMAIL && process.env.UNO_PASSWORD) {
    return { email: process.env.UNO_EMAIL, password: process.env.UNO_PASSWORD };
  }
  const raw = readJson<Partial<Credentials>>(PATHS.credentials, {});
  if (raw.email && raw.password) {
    return { email: raw.email.trim(), password: raw.password };
  }
  return null;
}

export function hasCredentialsFile(): boolean {
  return fileExists(PATHS.credentials);
}
