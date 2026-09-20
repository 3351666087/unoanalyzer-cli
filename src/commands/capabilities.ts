import { Command } from "commander";
import { action, opts } from "../core/run.js";
import { api } from "../core/client.js";
import { studentUid, resolveCourse, present } from "../core/context.js";
import { c, log, table, truncate } from "../core/ui.js";

export function register(program: Command): void {
  const cap = program.command("capability").description("Your demonstrated capabilities");

  cap
    .command("list")
    .description("List demonstrated capabilities with levels")
    .option("--course <idOrCode>", "filter by course")
    .action(
      action(async function (this: Command) {
        const { json } = opts(this);
        const o = this.opts();
        const uid = studentUid();
        const query: Record<string, string> = {};
        if (o.course) query.course_id = (await resolveCourse(o.course)).id;
        const data = await api.get<any>(`/student/${uid}/capabilities`, query);
        const caps = data.capabilities ?? [];
        present(json, data, () => {
          if (!caps.length) return log.warn("No capabilities recorded yet.");
          log.info(
            table(
              ["competency", "sub-capability", "level", "evidence"],
              caps.map((k: any) => [k.competencyId ?? "", truncate(k.name, 40), k.currentLevel ?? "", String(k.evidenceCount ?? 0)])
            )
          );
        });
      })
    );

  cap
    .command("evidence <subCapId>")
    .description("Show evidence backing one sub-capability")
    .action(
      action(async function (this: Command, subCapId: string) {
        const { json } = opts(this);
        const uid = studentUid();
        const data = await api.get<any>(`/student/${uid}/capability/${encodeURIComponent(subCapId)}/evidence`);
        present(json, data, () => log.info(JSON.stringify(data, null, 2)));
      })
    );

  const narrative = program.command("narrative").description("Your capability narrative");

  narrative
    .command("show")
    .description("Show the current narrative")
    .action(
      action(async function (this: Command) {
        const { json } = opts(this);
        const uid = studentUid();
        const n = await api.get<any>(`/student/${uid}/narrative`);
        present(json, n, () => {
          log.info(c.bold(`Narrative (${n.status ?? "none"})`));
          if (n.text) log.info("\n" + n.text);
          else log.info(c.dim("No narrative yet. Generate one with: uno narrative generate"));
        });
      })
    );

  narrative
    .command("generate")
    .description("Generate a capability narrative from your evidence")
    .action(
      action(async function (this: Command) {
        const { json } = opts(this);
        const uid = studentUid();
        const n = await api.post<any>(`/student/${uid}/narrative/generate`);
        present(json, n, () => {
          log.ok("Narrative generated.");
          if (n.text) log.info("\n" + n.text);
        });
      })
    );

  narrative
    .command("approve")
    .description("Approve/publish the generated narrative")
    .action(
      action(async function (this: Command) {
        const { json } = opts(this);
        const uid = studentUid();
        const n = await api.post<any>(`/student/${uid}/narrative/approve`);
        present(json, n, () => log.ok("Narrative approved."));
      })
    );
}
