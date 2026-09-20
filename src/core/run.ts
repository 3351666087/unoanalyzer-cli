import { Command } from "commander";
import { ApiError, AuthRequiredError } from "./errors.js";
import { log, c } from "./ui.js";
import { hasCredentialsFile, scaffoldCredentials } from "./config.js";
import { PATHS } from "./paths.js";

/** Wrap an async command action with uniform error handling + exit codes.
 *  Uses a normal function so Commander's `this` (the Command) is forwarded. */
export function action<A extends unknown[]>(fn: (...args: A) => Promise<void> | void) {
  return async function (this: unknown, ...args: A) {
    try {
      await fn.apply(this, args);
    } catch (e) {
      handleError(e);
      process.exitCode = 1;
    }
  };
}

function handleError(e: unknown): void {
  if (e instanceof AuthRequiredError) {
    log.error(e.message);
    if (!hasCredentialsFile()) {
      const path = scaffoldCredentials();
      log.info("");
      log.info(c.bold("First-time setup:"));
      log.info(`  1. Open ${c.cyan(path)}`);
      log.info(`  2. Fill in your platform ${c.bold("email")} and ${c.bold("password")}`);
      log.info(`  3. Run ${c.cyan("uno login")}`);
    } else {
      log.info(`Edit ${c.cyan(PATHS.credentials)} and run ${c.cyan("uno login")}.`);
    }
    return;
  }
  if (e instanceof ApiError) {
    log.error(e.message + (e.status ? c.gray(` (HTTP ${e.status})`) : ""));
    if (process.env.UNO_DEBUG && e.payload) log.info(JSON.stringify(e.payload, null, 2));
    return;
  }
  log.error((e as Error)?.message ?? String(e));
  if (process.env.UNO_DEBUG) console.error(e);
}

/** Read the merged global + local options (e.g. --json) for a command. */
export function opts(cmd: Command): { json: boolean } {
  const o = cmd.optsWithGlobals();
  return { json: Boolean(o.json) };
}
