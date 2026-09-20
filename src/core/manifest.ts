import fs from "node:fs";
import { PATHS, readJson, writeJson, fileExists } from "./paths.js";
import { getConfig, saveConfig, DEFAULT_CONFIG } from "./config.js";
import { discover } from "./discover.js";
import { CURATED_ENDPOINTS } from "../curated.js";
import { log } from "./ui.js";
import type { Endpoint, Manifest } from "../types.js";

/**
 * Merge curated + discovered endpoints.
 *
 * For a shared METHOD+path, the curated entry provides the human id/description
 * and readable param names, but LIVE-discovered `bodyFields` / `multipart` win
 * so the manifest tracks the platform: if the app renames a request field,
 * `uno sync` picks it up and convenience commands follow (see resolveBodyField).
 */
export function mergeEndpoints(discovered: Endpoint[]): Endpoint[] {
  const discByKey = new Map<string, Endpoint>();
  for (const e of discovered) discByKey.set(e.method + " " + e.path, e);

  const byKey = new Map<string, Endpoint>();
  for (const e of discovered) byKey.set(e.method + " " + e.path, e);
  for (const c of CURATED_ENDPOINTS) {
    const key = c.method + " " + c.path;
    const disc = discByKey.get(key);
    byKey.set(key, {
      ...c,
      bodyFields: disc?.bodyFields?.length ? disc.bodyFields : c.bodyFields,
      multipart: c.multipart ?? disc?.multipart,
    });
  }
  return [...byKey.values()].sort(
    (a, b) => a.category.localeCompare(b.category) || a.path.localeCompare(b.path)
  );
}

/** A manifest containing only curated endpoints (used before first sync). */
export function curatedOnlyManifest(): Manifest {
  const cfg = getConfig();
  return {
    syncedAt: "",
    bundleHash: "",
    appUrl: cfg.appUrl,
    platform: {
      backendUrl: cfg.backendUrl,
      supabaseUrl: cfg.supabaseUrl,
      supabasePublishableKey: cfg.supabasePublishableKey,
      apiPrefixes: [cfg.apiPrefix],
    },
    routes: [],
    endpoints: mergeEndpoints([]),
  };
}

export function loadManifest(): Manifest {
  if (fileExists(PATHS.manifest)) {
    const m = readJson<Manifest | null>(PATHS.manifest, null);
    if (m && Array.isArray(m.endpoints)) return m;
  }
  return curatedOnlyManifest();
}

export function saveManifest(m: Manifest): void {
  writeJson(PATHS.manifest, m);
}

export function findEndpoint(m: Manifest, idOrPath: string): Endpoint | undefined {
  return (
    m.endpoints.find((e) => e.id === idOrPath) ||
    m.endpoints.find((e) => e.path === idOrPath) ||
    m.endpoints.find((e) => `${e.method} ${e.path}` === idOrPath)
  );
}

/**
 * Run a full discovery pass and persist the merged manifest. Also refreshes the
 * platform config (Supabase key / hosts) in case they changed upstream.
 */
export async function runSync(opts: { quiet?: boolean } = {}): Promise<Manifest> {
  const cfg = getConfig();
  const result = await discover(cfg.appUrl);

  // Adopt any changed platform config so auth keeps working.
  const patch: Parameters<typeof saveConfig>[0] = { lastCheckAt: Date.now() };
  if (result.platform.backendUrl) patch.backendUrl = result.platform.backendUrl;
  if (result.platform.supabaseUrl) patch.supabaseUrl = result.platform.supabaseUrl;
  if (result.platform.supabasePublishableKey)
    patch.supabasePublishableKey = result.platform.supabasePublishableKey;
  const cnPrefix = result.platform.apiPrefixes.find((x) => x === "/api/cn");
  if (cnPrefix) patch.apiPrefix = cnPrefix;
  saveConfig(patch);

  const manifest: Manifest = {
    syncedAt: new Date().toISOString(),
    bundleHash: result.bundleHash,
    appUrl: result.appUrl,
    platform: result.platform,
    routes: result.routes,
    endpoints: mergeEndpoints(result.endpoints),
  };
  saveManifest(manifest);

  if (!opts.quiet) {
    const discovered = result.endpoints.length;
    log.ok(
      `Synced ${manifest.endpoints.length} endpoints (${discovered} discovered, ` +
        `${CURATED_ENDPOINTS.length} curated) · ${result.routes.length} routes · build ${result.bundleHash}`
    );
  }
  return manifest;
}

/** Cheap staleness probe: just read the app HTML and compare the bundle hash. */
async function liveBundleHash(appUrl: string, timeoutMs = 5000): Promise<string | null> {
  const base = appUrl.endsWith("/") ? appUrl : appUrl + "/";
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(base, { signal: ctrl.signal });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/assets\/index-([A-Za-z0-9_-]+)\.js/);
    return m ? m[1] : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Fully automatic sync: if the platform bundle changed since our manifest was
 * built, re-run discovery. Rate-limited by config.syncCheckIntervalSec and
 * always non-fatal (falls back to the cached manifest on any error).
 */
export async function ensureFreshManifest(): Promise<Manifest> {
  const cfg = getConfig();
  let manifest = loadManifest();

  if (!cfg.autoSync) return manifest;

  const now = Date.now();
  const dueForCheck =
    !manifest.bundleHash ||
    !cfg.lastCheckAt ||
    now - cfg.lastCheckAt > cfg.syncCheckIntervalSec * 1000;
  if (!dueForCheck) return manifest;

  const hash = await liveBundleHash(cfg.appUrl);
  saveConfig({ lastCheckAt: now });
  if (!hash) return manifest; // offline / probe failed — keep cache silently

  if (hash !== manifest.bundleHash) {
    log.step("Platform updated — refreshing local command set…");
    try {
      manifest = await runSync({ quiet: false });
    } catch (e) {
      log.debug(`Auto-sync failed, keeping cached manifest: ${(e as Error).message}`);
    }
  }
  return manifest;
}

export function manifestStatus(): { exists: boolean; syncedAt: string; count: number; bundle: string } {
  const m = loadManifest();
  return {
    exists: fileExists(PATHS.manifest),
    syncedAt: m.syncedAt || "never",
    count: m.endpoints.length,
    bundle: m.bundleHash || "—",
  };
}
