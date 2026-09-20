import { Command } from "commander";
import { action, opts } from "../core/run.js";
import { api } from "../core/client.js";
import { studentUid, resolveCourse, present } from "../core/context.js";
import { c, log, keyValue } from "../core/ui.js";

export function register(program: Command): void {
  program
    .command("mentor <idOrCode>")
    .description("Show your assigned mentor for a course")
    .action(
      action(async function (this: Command, idOrCode: string) {
        const { json } = opts(this);
        const co = await resolveCourse(idOrCode);
        const data = await api.get<any>(`/courses/${co.id}/my-mentor`);
        present(json, data, () => {
          if (!data?.mentor) return log.warn("No mentor assigned yet.");
          log.info(c.bold(`Mentor for ${co.code}`));
          log.info(
            keyValue([
              ["Name", data.mentor.name],
              ["Email", data.mentor.email],
              ["Group", data.groupName ?? "—"],
              ["Office hours", data.mentor.officeHours || "—"],
            ])
          );
        });
      })
    );

  program
    .command("brief [idOrCode]")
    .description("Your weekly AI briefing (optionally filtered to one course)")
    .action(
      action(async function (this: Command, idOrCode: string | undefined) {
        const { json } = opts(this);
        const uid = studentUid();
        const data = await api.get<{ briefings: any[] }>(`/student/${uid}/briefing`);
        let briefings = data.briefings ?? [];
        if (idOrCode) {
          const co = await resolveCourse(idOrCode);
          briefings = briefings.filter((b) => b.courseId === co.id);
        }
        present(json, briefings, () => {
          if (!briefings.length) return log.warn("No briefings available.");
          for (const b of briefings) {
            log.info(c.bold(`${b.courseId} · week ${b.currentWeek ?? "?"}`));
            if (b.greeting) log.info(b.greeting);
            if (Array.isArray(b.what_next) && b.what_next.length) {
              log.info(c.bold("\nWhat next:"));
              for (const item of b.what_next) log.info("  • " + item);
            }
            log.info("");
          }
        });
      })
    );
}
