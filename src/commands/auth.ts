import { Command } from "commander";
import { action, opts } from "../core/run.js";
import { login as doLogin, loadSession, clearSession, refreshProfile } from "../core/session.js";
import { loadCredentials, scaffoldCredentials, hasCredentialsFile } from "../core/config.js";
import { api } from "../core/client.js";
import { AuthRequiredError } from "../core/errors.js";
import { PATHS } from "../core/paths.js";
import { c, log, keyValue } from "../core/ui.js";
import { present } from "../core/context.js";

export function register(program: Command): void {
  program
    .command("login")
    .description("Authenticate using ~/.unoanalyzer/credentials.json (or UNO_EMAIL/UNO_PASSWORD)")
    .action(
      action(async () => {
        const creds = loadCredentials();
        if (!creds) {
          const path = scaffoldCredentials();
          log.warn("No credentials found.");
          log.info("");
          log.info(c.bold("First-time setup:"));
          log.info(`  1. Open ${c.cyan(path)}`);
          log.info(`  2. Fill in your platform ${c.bold("email")} and ${c.bold("password")}`);
          log.info(`  3. Run ${c.cyan("uno login")} again`);
          log.info("");
          log.info(c.gray("You can also set UNO_EMAIL and UNO_PASSWORD env vars instead."));
          process.exitCode = 1;
          return;
        }
        log.step(`Signing in as ${creds.email}…`);
        const session = await doLogin(creds.email, creds.password);
        log.ok(`Logged in as ${c.bold(session.user.fullName || session.user.email)} (${session.user.role}).`);
        log.info(c.gray("Session saved. It refreshes automatically — you only need to log in once."));
      })
    );

  program
    .command("logout")
    .description("Clear the saved session (credentials file is kept)")
    .action(
      action(async () => {
        clearSession();
        log.ok("Session cleared.");
        if (hasCredentialsFile())
          log.info(c.gray(`Credentials file kept at ${PATHS.credentials}. Delete it manually to fully sign out.`));
      })
    );

  program
    .command("whoami")
    .description("Show the currently signed-in user")
    .action(
      action(async function (this: Command) {
        const s = loadSession();
        if (!s) throw new AuthRequiredError();
        const { json } = opts(this);
        present(json, s.user, () => {
          log.info(
            keyValue([
              ["Name", s.user.fullName ?? "—"],
              ["Email", s.user.email],
              ["Role", s.user.role],
              ["UID", s.user.uid],
              ["Verified", s.user.isVerified ? "yes" : "no"],
              ["Session", new Date(s.expiresAt).getTime() > Date.now() ? "valid" : "expired (auto-refreshes)"],
            ])
          );
        });
      })
    );

  program
    .command("me")
    .description("Fetch fresh profile + account tier from the server")
    .action(
      action(async function (this: Command) {
        const { json } = opts(this);
        const profile = await refreshProfile();
        const tier = await api.get<Record<string, any>>("/student/me/tier").catch(() => ({} as Record<string, any>));
        present(json, { profile, tier }, () => {
          log.info(c.bold("Profile"));
          log.info(
            keyValue([
              ["Name", profile.fullName ?? "—"],
              ["Email", profile.email],
              ["Role", profile.role],
              ["Module leader", profile.isModuleLeader ? "yes" : "no"],
              ["Course staff", profile.isCourseStaff ? "yes" : "no"],
              ["Language", (profile.language as string) ?? "—"],
            ])
          );
          log.info("");
          log.info(c.bold("Account tier"));
          log.info(
            keyValue([
              ["Tier", (tier.account_tier as string) ?? "—"],
              ["Institution", (tier.linked_institution as string) ?? "—"],
              ["Linked courses", ((tier.linked_courses as string[]) ?? []).join(", ") || "—"],
            ])
          );
        });
      })
    );
}
