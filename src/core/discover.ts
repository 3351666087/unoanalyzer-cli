/**
 * Endpoint discovery engine.
 *
 * Fetches the live UnoAnalyzer SPA, downloads its JavaScript chunks, and
 * statically extracts every /api/* endpoint, SPA route, and platform config
 * value. This is what lets the CLI stay in sync with the platform: when the
 * app is rebuilt the entry-bundle hash changes, `uno sync` re-runs this, and
 * newly added endpoints immediately become available via `uno endpoints` /
 * `uno call` and in the agent skill's reference catalog.
 */
import { log } from "./ui.js";
import type { Endpoint, EndpointParam, Manifest } from "../types.js";

export interface DiscoveryResult extends Omit<Manifest, "syncedAt"> {}

async function getText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} → HTTP ${res.status}`);
  return res.text();
}

/** Turn kebab/camel plural segment into a nice "<singular>Id" param name. */
function paramNameFor(prevSegment: string | undefined, index: number): string {
  if (!prevSegment || prevSegment.includes(":") || prevSegment.startsWith("$")) {
    return `arg${index}`;
  }
  const camel = prevSegment.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
  const singular = camel.endsWith("s") ? camel.slice(0, -1) : camel;
  if (!singular || !/^[a-zA-Z]/.test(singular)) return `arg${index}`;
  return singular + "Id";
}

/** Normalize a raw discovered path template into `/path/:param` + params. */
function normalizePath(raw: string): { path: string; params: EndpointParam[] } | null {
  let s = raw;

  // Collapse the `chinaFeatures ? "/api/cn" : "/api"` conditional to /api/cn.
  s = s.replace(/\$\{[^}]*["']\/api\/cn["'][^}]*\}/g, "/api/cn");
  // A leading `${x}` that is clearly a base URL variable → drop (handled by prefix).
  s = s.replace(/^\$\{[a-zA-Z_$][\w.]*\}(?=\/)/, "");

  // Split off query string.
  const [pathPart, queryPart] = s.split("?");
  const params: EndpointParam[] = [];

  // Path params.
  const segments = pathPart.split("/");
  let argIdx = 0;
  const outSegments = segments.map((seg, i) => {
    if (seg.includes("${") || seg === "") {
      if (seg === "") return "";
      argIdx += 1;
      const name = paramNameFor(segments[i - 1], argIdx);
      params.push({ name, in: "path", required: true });
      return ":" + name;
    }
    return seg;
  });
  let path = outSegments.join("/");

  // Only keep things that resolved to a real API path.
  if (!path.includes("/api/")) return null;
  // Drop bare prefixes like /api/cn or /api/v1 with nothing after.
  if (/^\/api\/(cn|v1)?\/?$/.test(path)) return null;

  // Query params of the form key=${...}
  if (queryPart) {
    for (const m of queryPart.matchAll(/([\w-]+)=\$\{[^}]*\}/g)) {
      params.push({ name: m[1], in: "query", required: false });
    }
  }

  return { path, params };
}

function makeId(method: string, path: string, taken: Set<string>): string {
  const slug = path
    .replace(/^\/api\/(cn|v1)\//, "")
    .replace(/^\/api\//, "")
    .replace(/:/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
  let id = `${method.toLowerCase()}_${slug}`;
  let n = 2;
  while (taken.has(id)) id = `${method.toLowerCase()}_${slug}_${n++}`;
  taken.add(id);
  return id;
}

/** Build a name → template map for `function h(a){return`...`}` helpers. */
function collectHelpers(src: string): Map<string, string> {
  const map = new Map<string, string>();
  const reFn = /function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*return\s*`([^`]+)`\s*\}/g;
  for (const m of src.matchAll(reFn)) map.set(m[1], m[2]);
  const reArrow = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*\([^)]*\)\s*=>\s*`([^`]+)`/g;
  for (const m of src.matchAll(reArrow)) map.set(m[1], m[2]);
  return map;
}

/** Inline `${helper(...)}` occurrences at the start of a path template. */
function inlineHelpers(tpl: string, helpers: Map<string, string>): string {
  let out = tpl;
  for (let i = 0; i < 3; i++) {
    const m = out.match(/^\$\{([A-Za-z_$][\w$]*)\([^)]*\)\}/);
    if (!m || !helpers.has(m[1])) break;
    out = helpers.get(m[1])! + out.slice(m[0].length);
  }
  return out;
}

/** Extract endpoints from one chunk of JS source. */
function extractEndpoints(src: string, category: string, taken: Set<string>): Endpoint[] {
  const helpers = collectHelpers(src);
  const found: Endpoint[] = [];
  const seen = new Set<string>();

  // Call sites of the form  fn(`PATH`, { ...opts })  or  fn(`PATH`)
  const reCall =
    /[A-Za-z_$][\w$]*\(\s*`([^`]+)`\s*(?:,\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\})?\s*\)/g;
  for (const m of src.matchAll(reCall)) {
    let tpl = m[1];
    const opts = m[2] ?? "";
    if (!/\/api\//.test(tpl) && !/^\$\{[A-Za-z_$]/.test(tpl)) continue;
    tpl = inlineHelpers(tpl, helpers);
    const norm = normalizePath(tpl);
    if (!norm) continue;
    const methodMatch = opts.match(/method:\s*["'`](\w+)["'`]/);
    const method = (methodMatch ? methodMatch[1] : "GET").toUpperCase();
    const multipart = /multipart\s*:\s*!?0|multipart\s*:\s*true|multipart:!0/.test(opts);
    const key = method + " " + norm.path;
    if (seen.has(key)) continue;
    seen.add(key);
    found.push({
      id: makeId(method, norm.path, taken),
      method,
      path: norm.path,
      category,
      params: norm.params,
      ...(multipart ? { multipart: true } : {}),
      source: "discovered",
    });
  }

  // Bare string paths not caught above (default GET).
  for (const m of src.matchAll(/["'`](\/api\/[A-Za-z0-9_${}\/?.=&:-]+)["'`]/g)) {
    const norm = normalizePath(m[1]);
    if (!norm) continue;
    const key = "GET " + norm.path;
    if (seen.has(key)) continue;
    // Skip if any method for this path already recorded.
    if (found.some((e) => e.path === norm.path)) continue;
    seen.add(key);
    found.push({
      id: makeId("GET", norm.path, taken),
      method: "GET",
      path: norm.path,
      category,
      params: norm.params,
      source: "discovered",
    });
  }

  return found;
}

/** Run full discovery against an SPA app URL. */
export async function discover(appUrl: string): Promise<DiscoveryResult> {
  const base = appUrl.endsWith("/") ? appUrl : appUrl + "/";
  const origin = new URL(base).origin;

  log.step(`Fetching app shell: ${base}`);
  const html = await getText(base);
  const entryMatch = html.match(/assets\/index-[A-Za-z0-9_-]+\.js/);
  if (!entryMatch) throw new Error("Could not locate the SPA entry bundle in the app HTML.");
  const entryPath = entryMatch[0];
  const bundleHash = entryPath.replace(/^assets\/index-|\.js$/g, "");

  const entryUrl = new URL(entryPath, base).toString();
  log.step(`Reading entry bundle: ${entryPath}`);
  const entry = await getText(entryUrl);

  // Chunk filenames.
  const chunks = [
    ...new Set(
      [...entry.matchAll(/["'`](assets\/[A-Za-z0-9_-]+-[A-Za-z0-9_]+\.js)["'`]/g)].map((m) => m[1])
    ),
  ];

  // Routes.
  const routes = [
    ...new Set([...entry.matchAll(/path:["'`]([^"'`]+)["'`]/g)].map((m) => m[1])),
  ].sort();

  // Platform config.
  const pick = (re: RegExp): string | undefined => entry.match(re)?.[1];
  const platform = {
    backendUrl: pick(/backendUrl:["'`]([^"'`]+)["'`]/) ?? origin,
    supabaseUrl: pick(/supabaseUrl:["'`]([^"'`]+)["'`]/) ?? origin,
    supabasePublishableKey: pick(/supabasePublishableKey:["'`]([^"'`]+)["'`]/) ?? "",
    apiPrefixes: [] as string[],
  };

  const taken = new Set<string>();
  const allEndpoints: Endpoint[] = [];

  // The entry bundle itself has some endpoints (auth, me, users…).
  allEndpoints.push(...extractEndpoints(entry, "core", taken));

  log.step(`Scanning ${chunks.length} code chunks for endpoints…`);
  const concurrency = 8;
  for (let i = 0; i < chunks.length; i += concurrency) {
    const slice = chunks.slice(i, i + concurrency);
    const texts = await Promise.all(
      slice.map(async (chunk) => {
        try {
          return { chunk, src: await getText(new URL(chunk, base).toString()) };
        } catch {
          return { chunk, src: "" };
        }
      })
    );
    for (const { chunk, src } of texts) {
      if (!src) continue;
      const category = chunk.replace(/^assets\//, "").replace(/-[A-Za-z0-9_]+\.js$/, "");
      allEndpoints.push(...extractEndpoints(src, category, taken));
    }
  }

  // Collect the distinct API prefixes actually observed.
  const prefixes = new Set<string>();
  for (const e of allEndpoints) {
    const m = e.path.match(/^\/api\/(cn|v1)?/);
    if (m) prefixes.add(m[0]);
  }
  platform.apiPrefixes = [...prefixes].sort();

  // Stable ordering: by category then path.
  allEndpoints.sort((a, b) => a.category.localeCompare(b.category) || a.path.localeCompare(b.path));

  return {
    bundleHash,
    appUrl: base,
    platform,
    routes,
    endpoints: allEndpoints,
  };
}
