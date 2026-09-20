import { Command } from "commander";
import { action, opts } from "../core/run.js";
import { api } from "../core/client.js";
import { loadManifest, runSync, findEndpoint, manifestStatus } from "../core/manifest.js";
import { getConfig } from "../core/config.js";
import { loadSession } from "../core/session.js";
import { studentUid, present } from "../core/context.js";
import { c, log, table, keyValue, truncate, printJson } from "../core/ui.js";
import type { Endpoint } from "../types.js";

function parseKv(pairs: string[] | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const kv of pairs ?? []) {
    const i = kv.indexOf("=");
    if (i === -1) throw new Error(`Expected key=value, got "${kv}"`);
    out[kv.slice(0, i)] = kv.slice(i + 1);
  }
  return out;
}

export function register(program: Command): void {
  // ---- sync ----------------------------------------------------------
  program
    .command("sync")
    .description("Re-discover the platform API and update the local command set")
    .action(
      action(async () => {
        await runSync();
      })
    );

  // ---- status --------------------------------------------------------
  program
    .command("status")
    .description("Show session, manifest and platform status")
    .action(
      action(async function (this: Command) {
        const { json } = opts(this);
        const s = loadSession();
        const cfg = getConfig();
        const man = manifestStatus();
        const data = { loggedIn: !!s, user: s?.user ?? null, manifest: man, config: cfg };
        present(json, data, () => {
          log.info(c.bold("Session"));
          log.info(
            keyValue([
              ["Logged in", s ? "yes" : "no"],
              ["User", s ? `${s.user.fullName || s.user.email} (${s.user.role})` : "—"],
            ])
          );
          log.info("");
          log.info(c.bold("Manifest"));
          log.info(
            keyValue([
              ["Endpoints", man.count],
              ["Last sync", man.syncedAt],
              ["Platform build", man.bundle],
              ["Auto-sync", cfg.autoSync ? "on" : "off"],
            ])
          );
          log.info("");
          log.info(c.bold("Platform"));
          log.info(
            keyValue([
              ["App URL", cfg.appUrl],
              ["Backend", cfg.backendUrl],
              ["API prefix", cfg.apiPrefix],
            ])
          );
        });
      })
    );

  // ---- endpoints -----------------------------------------------------
  program
    .command("endpoints [filter]")
    .description("List all known API endpoints (curated + auto-discovered)")
    .option("-c, --category <name>", "filter by category")
    .option("--curated", "only curated endpoints")
    .action(
      action(async function (this: Command, filter: string | undefined) {
        const { json } = opts(this);
        const o = this.opts();
        const m = loadManifest();
        let eps = m.endpoints;
        if (o.category) eps = eps.filter((e) => e.category === o.category);
        if (o.curated) eps = eps.filter((e) => e.source === "curated");
        if (filter) {
          const n = filter.toLowerCase();
          eps = eps.filter(
            (e) => e.id.toLowerCase().includes(n) || e.path.toLowerCase().includes(n) || (e.description ?? "").toLowerCase().includes(n)
          );
        }
        present(json, eps, () => {
          if (!eps.length) return log.warn("No endpoints match.");
          const rows = eps.map((e) => [
            e.source === "curated" ? c.green(e.id) : e.id,
            e.method,
            e.path,
            truncate(e.description, 46),
          ]);
          log.info(table(["id", "method", "path", "description"], rows));
          log.info("");
          log.info(c.gray(`${eps.length} endpoints. Invoke any with: uno call <id> [params…]`));
        });
      })
    );

  // ---- describe one endpoint ----------------------------------------
  program
    .command("describe <id>")
    .description("Show the full definition of one endpoint")
    .action(
      action(async function (this: Command, id: string) {
        const { json } = opts(this);
        const m = loadManifest();
        const e = findEndpoint(m, id);
        if (!e) throw new Error(`Unknown endpoint "${id}". Try: uno endpoints ${id}`);
        present(json, e, () => {
          log.info(
            keyValue([
              ["id", e.id],
              ["method", e.method],
              ["path", e.path],
              ["category", e.category],
              ["source", e.source],
              ["multipart", e.multipart ? "yes" : "no"],
              ["params", e.params.map((p) => `${p.name}${p.required ? "*" : ""}(${p.in})`).join(", ") || "—"],
              ["description", e.description ?? "—"],
            ])
          );
        });
      })
    );

  // ---- call a manifest endpoint by id -------------------------------
  program
    .command("call <id> [values...]")
    .description("Invoke a known endpoint by id; positional values fill path params in order")
    .option("-q, --query <k=v...>", "query parameter(s)")
    .option("-d, --data <json>", "JSON request body")
    .option("--data-file <path>", "read JSON request body from a file")
    .option("-f, --file <path>", "file to upload (multipart endpoints)")
    .option("--field <k=v...>", "extra multipart form field(s)")
    .action(
      action(async function (this: Command, id: string, values: string[]) {
        const o = this.opts();
        const m = loadManifest();
        const e = findEndpoint(m, id);
        if (!e) throw new Error(`Unknown endpoint "${id}". Try: uno endpoints ${id}`);
        const path = fillPath(e, values);
        const query = parseKv(o.query);

        let result: unknown;
        if (e.multipart || o.file) {
          const form = new FormData();
          if (o.file) {
            const fs = await import("node:fs");
            const pathMod = await import("node:path");
            const buf = fs.readFileSync(o.file);
            form.append("file", new Blob([buf]), pathMod.basename(o.file));
          }
          for (const [k, v] of Object.entries(parseKv(o.field))) form.append(k, v);
          result = await api.upload(path, form, e.method);
        } else {
          const body = await readBody(o);
          result = await api.request(path, { method: e.method, body, query });
        }
        printJson(result);
      })
    );

  // ---- raw api call --------------------------------------------------
  program
    .command("api <method> <path>")
    .description("Raw authenticated request. path may be /api/cn/... or relative (courses/x)")
    .option("-q, --query <k=v...>", "query parameter(s)")
    .option("-d, --data <json>", "JSON request body")
    .option("--data-file <path>", "read JSON body from a file")
    .action(
      action(async function (this: Command, method: string, path: string) {
        const o = this.opts();
        const query = parseKv(o.query);
        const body = await readBody(o);
        const result = await api.request(path, { method: method.toUpperCase(), body, query });
        printJson(result);
      })
    );
}

function fillPath(e: Endpoint, values: string[]): string {
  const pathParams = e.params.filter((p) => p.in === "path");
  let path = e.path;
  let vi = 0;
  for (const param of pathParams) {
    let val = values[vi++];
    if (val === undefined && param.name === "studentUid") {
      try {
        val = studentUid();
      } catch {
        /* not logged in yet — will error below */
      }
    }
    if (val === undefined) {
      throw new Error(
        `Missing value for path param "${param.name}". Params: ${pathParams.map((p) => p.name).join(", ")}`
      );
    }
    path = path.replace(`:${param.name}`, encodeURIComponent(val));
  }
  return path;
}

async function readBody(o: { data?: string; dataFile?: string }): Promise<unknown> {
  if (o.dataFile) {
    const fs = await import("node:fs");
    return JSON.parse(fs.readFileSync(o.dataFile, "utf8"));
  }
  if (o.data) {
    try {
      return JSON.parse(o.data);
    } catch {
      throw new Error("--data must be valid JSON");
    }
  }
  return undefined;
}
