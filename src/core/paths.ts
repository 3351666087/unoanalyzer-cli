import os from "node:os";
import path from "node:path";
import fs from "node:fs";

/** Root config directory. Overridable via UNO_HOME for testing / multi-account. */
export const CONFIG_DIR =
  process.env.UNO_HOME || path.join(os.homedir(), ".unoanalyzer");

export const PATHS = {
  dir: CONFIG_DIR,
  config: path.join(CONFIG_DIR, "config.json"),
  credentials: path.join(CONFIG_DIR, "credentials.json"),
  session: path.join(CONFIG_DIR, "session.json"),
  manifest: path.join(CONFIG_DIR, "manifest.json"),
};

export function ensureDir(): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
}

/** Read + parse a JSON file, or return `fallback` if missing/unparseable. */
export function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

/** Write JSON atomically with restrictive permissions (0600). */
export function writeJson(file: string, value: unknown): void {
  ensureDir();
  const tmp = file + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, file);
}

export function fileExists(file: string): boolean {
  try {
    fs.accessSync(file);
    return true;
  } catch {
    return false;
  }
}
