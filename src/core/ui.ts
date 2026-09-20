/**
 * Tiny zero-dependency terminal helpers: colours, logging, tables, spinners.
 * Colours degrade gracefully when NO_COLOR is set or stdout is not a TTY.
 */

const useColor =
  process.env.NO_COLOR === undefined &&
  process.env.UNO_NO_COLOR === undefined &&
  process.stdout.isTTY === true;

function wrap(open: number, close: number) {
  return (s: string | number): string =>
    useColor ? `[${open}m${s}[${close}m` : String(s);
}

export const c = {
  bold: wrap(1, 22),
  dim: wrap(2, 22),
  red: wrap(31, 39),
  green: wrap(32, 39),
  yellow: wrap(33, 39),
  blue: wrap(34, 39),
  magenta: wrap(35, 39),
  cyan: wrap(36, 39),
  gray: wrap(90, 39),
};

/** Structured logging to stderr so stdout stays clean for piping / --json. */
export const log = {
  info: (msg: string) => process.stderr.write(msg + "\n"),
  ok: (msg: string) => process.stderr.write(c.green("✓ ") + msg + "\n"),
  warn: (msg: string) => process.stderr.write(c.yellow("! ") + msg + "\n"),
  error: (msg: string) => process.stderr.write(c.red("✗ ") + msg + "\n"),
  step: (msg: string) => process.stderr.write(c.cyan("→ ") + msg + "\n"),
  debug: (msg: string) => {
    if (process.env.UNO_DEBUG) process.stderr.write(c.gray("· " + msg) + "\n");
  },
};

/** Print machine-readable JSON to stdout. */
export function printJson(value: unknown): void {
  process.stdout.write(JSON.stringify(value, null, 2) + "\n");
}

function displayWidth(s: string): number {
  // Strip ANSI, then count wide (CJK) chars as 2 columns.
  const plain = s.replace(/\[[0-9;]*m/g, "");
  let w = 0;
  for (const ch of plain) {
    const cp = ch.codePointAt(0)!;
    const wide =
      (cp >= 0x1100 && cp <= 0x115f) ||
      (cp >= 0x2e80 && cp <= 0xa4cf) ||
      (cp >= 0xac00 && cp <= 0xd7a3) ||
      (cp >= 0xf900 && cp <= 0xfaff) ||
      (cp >= 0xff00 && cp <= 0xff60) ||
      (cp >= 0x20000 && cp <= 0x3fffd);
    w += wide ? 2 : 1;
  }
  return w;
}

function pad(s: string, width: number): string {
  const gap = width - displayWidth(s);
  return gap > 0 ? s + " ".repeat(gap) : s;
}

/** Render a simple aligned table. Rows are arrays of strings. */
export function table(headers: string[], rows: string[][]): string {
  const widths = headers.map((h, i) =>
    Math.max(displayWidth(h), ...rows.map((r) => displayWidth(r[i] ?? "")))
  );
  const head = headers.map((h, i) => c.bold(pad(h, widths[i]))).join("  ");
  const sep = c.gray(widths.map((w) => "─".repeat(w)).join("  "));
  const body = rows
    .map((r) => r.map((cell, i) => pad(cell ?? "", widths[i])).join("  "))
    .join("\n");
  return [head, sep, body].filter(Boolean).join("\n");
}

/** key: value block for a single object. */
export function keyValue(pairs: [string, string | number | null | undefined][]): string {
  const width = Math.max(...pairs.map(([k]) => displayWidth(k)));
  return pairs
    .map(([k, v]) => `${c.gray(pad(k, width))}  ${v ?? c.dim("—")}`)
    .join("\n");
}

export function truncate(s: string | null | undefined, n = 60): string {
  if (!s) return "";
  const oneLine = String(s).replace(/\s+/g, " ").trim();
  return oneLine.length > n ? oneLine.slice(0, n - 1) + "…" : oneLine;
}
