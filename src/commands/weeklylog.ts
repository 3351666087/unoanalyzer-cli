import { Command } from "commander";
import { action, opts } from "../core/run.js";
import { api } from "../core/client.js";
import { resolveCourse, myGroup, present } from "../core/context.js";
import { c, log, table, truncate } from "../core/ui.js";

async function ctx(idOrCode: string) {
  const co = await resolveCourse(idOrCode);
  const group = await myGroup(co.id);
  if (!group) throw new Error(`You are not in a group in ${co.code}.`);
  return { co, group };
}

export function register(program: Command): void {
  const logCmd = program.command("log").description("Weekly logs for your group");

  logCmd
    .command("list <idOrCode>")
    .description("List all weekly logs")
    .action(
      action(async function (this: Command, idOrCode: string) {
        const { json } = opts(this);
        const { co, group } = await ctx(idOrCode);
        const data = await api.get<{ logs: any[] }>(`/courses/${co.id}/groups/${group.id}/weekly-logs`);
        const logs = data.logs ?? [];
        present(json, logs, () => {
          if (!logs.length) return log.warn("No weekly logs yet.");
          log.info(
            table(
              ["week", "summary", "entries"],
              logs.map((l) => [String(l.week ?? l.weekNumber ?? ""), truncate(l.summary ?? l.text, 50), String((l.entries ?? []).length)])
            )
          );
        });
      })
    );

  logCmd
    .command("show <idOrCode> <week>")
    .description("Show one week's log entry")
    .action(
      action(async function (this: Command, idOrCode: string, week: string) {
        const { json } = opts(this);
        const { co, group } = await ctx(idOrCode);
        const entry = await api.get<any>(`/courses/${co.id}/groups/${group.id}/weekly-logs/${encodeURIComponent(week)}`);
        present(json, entry, () => {
          if (!entry) return log.warn(`No log for week ${week}.`);
          log.info(c.bold(`Week ${week}`));
          log.info(JSON.stringify(entry, null, 2));
        });
      })
    );

  logCmd
    .command("submit <idOrCode> <week>")
    .description("Submit/update YOUR entry for a week")
    .option("-t, --text <text>", "free-text contribution (sent as { text })")
    .option("-d, --data <json>", "full entry object as JSON (overrides --text)")
    .action(
      action(async function (this: Command, idOrCode: string, week: string) {
        const { json } = opts(this);
        const o = this.opts();
        let body: unknown;
        if (o.data) {
          try {
            body = JSON.parse(o.data);
          } catch {
            throw new Error("--data must be valid JSON");
          }
        } else if (o.text) {
          body = { text: o.text };
        } else {
          throw new Error("Provide --text or --data with the entry content.");
        }
        const { co, group } = await ctx(idOrCode);
        const result = await api.put(`/courses/${co.id}/groups/${group.id}/weekly-logs/${encodeURIComponent(week)}/my-entry`, body);
        present(json, result, () => log.ok(`Submitted your week ${week} entry.`));
      })
    );
}
