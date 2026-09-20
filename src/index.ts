#!/usr/bin/env node
import "./core/net.js"; // configure proxy (if any) before the first fetch
import { Command } from "commander";
import { createRequire } from "node:module";
import { ensureFreshManifest } from "./core/manifest.js";
import { log } from "./core/ui.js";

import * as auth from "./commands/auth.js";
import * as platform from "./commands/platform.js";
import * as courses from "./commands/courses.js";
import * as groups from "./commands/groups.js";
import * as weeklylog from "./commands/weeklylog.js";
import * as records from "./commands/records.js";
import * as capabilities from "./commands/capabilities.js";
import * as spaces from "./commands/spaces.js";
import * as mentor from "./commands/mentor.js";
import * as chat from "./commands/chat.js";
import * as proposals from "./commands/proposals.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

/** Commands that never need the platform manifest / network probe. */
const OFFLINE_COMMANDS = new Set(["login", "logout", "whoami", "help", "sync"]);

const program = new Command();

program
  .name("uno")
  .description(
    "UnoAnalyzer CLI — a self-updating command-line client for cn.unoanalyzer.com.\n" +
      "Focused on the ENT207TC student workflow. Log in once; the session and the\n" +
      "command set both stay up to date automatically."
  )
  .version(pkg.version, "-v, --version")
  .option("--json", "output raw JSON (machine-readable)", false)
  .showHelpAfterError();

// Fully-automatic sync: refresh the manifest when the platform build changes.
program.hook("preAction", async (thisCommand, actionCommand) => {
  const top = actionCommand.parent?.name() === "uno" ? actionCommand.name() : actionCommand.parent?.name();
  const name = top ?? actionCommand.name();
  if (OFFLINE_COMMANDS.has(name)) return;
  try {
    await ensureFreshManifest();
  } catch (e) {
    log.debug(`preAction sync skipped: ${(e as Error).message}`);
  }
});

for (const mod of [auth, platform, courses, groups, weeklylog, records, capabilities, spaces, mentor, chat, proposals]) {
  mod.register(program);
}

// Let `--json` be accepted after any (sub)command, not just before it.
function addJsonEverywhere(cmd: Command) {
  for (const sub of cmd.commands) {
    if (!sub.options.some((o) => o.long === "--json")) {
      sub.option("--json", "output raw JSON (machine-readable)");
    }
    addJsonEverywhere(sub);
  }
}
addJsonEverywhere(program);

program.addHelpText(
  "after",
  `
Examples:
  $ uno login                      Sign in (fills credentials file on first run)
  $ uno courses                    List your courses
  $ uno course show ENT207TC       Course overview
  $ uno brief ENT207TC             This week's briefing
  $ uno log submit ENT207TC 2 -t "Did desk research"
  $ uno record create -t "User interview" --course ENT207TC
  $ uno endpoints groups           Browse the live API catalogue
  $ uno call course.detail ent207tc_2026 --json
  $ uno api GET /api/cn/me         Raw authenticated request

Config lives in ~/.unoanalyzer/ (credentials.json, session.json, manifest.json).
`
);

program.parseAsync(process.argv).catch((e) => {
  log.error((e as Error).message);
  process.exit(1);
});
