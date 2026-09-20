import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import { action, opts } from "../core/run.js";
import { api } from "../core/client.js";
import { resolveCourse, present } from "../core/context.js";
import { c, log, table, keyValue, truncate } from "../core/ui.js";

export function register(program: Command): void {
  const record = program.command("record").description("Evidence records for your capability profile");

  record
    .command("list")
    .description("List my records")
    .action(
      action(async function (this: Command) {
        const { json } = opts(this);
        const items = await api.get<any[]>("/records");
        present(json, items, () => {
          if (!items.length) return log.warn("No records yet. Create one with: uno record create --title ...");
          log.info(
            table(
              ["id", "date", "title", "proofs"],
              items.map((r) => [r.id, r.date ?? "", truncate(r.title, 40), String((r.proof_files ?? r.proof_urls ?? []).length)])
            )
          );
        });
      })
    );

  record
    .command("show <id>")
    .description("Show a record with matched sub-capabilities")
    .action(
      action(async function (this: Command, id: string) {
        const { json } = opts(this);
        const r = await api.get<any>(`/records/${id}`);
        present(json, r, () => {
          log.info(c.bold(r.title ?? id));
          log.info(
            keyValue([
              ["Date", r.date ?? "—"],
              ["Course", r.course_id ?? "—"],
              ["Private", r.keep_private ? "yes" : "no"],
              ["Proofs", (r.proof_files ?? r.proof_urls ?? []).length],
              ["Matched caps", (r.matchedSubcapabilities ?? []).length],
            ])
          );
          if (r.description) log.info("\n" + r.description);
        });
      })
    );

  record
    .command("create")
    .description("Create a new evidence record")
    .requiredOption("-t, --title <title>", "record title")
    .option("--description <text>", "description")
    .option("--date <yyyy-mm-dd>", "date (defaults to today)")
    .option("--course <idOrCode>", "link to a course")
    .option("--link <url>", "attach an evidence link")
    .option("--context <type>", "context type")
    .option("--location <place>", "location")
    .option("--private", "keep this record private")
    .action(
      action(async function (this: Command) {
        const { json } = opts(this);
        const o = this.opts();
        const body: Record<string, unknown> = {
          title: o.title,
          description: o.description ?? "",
          date: o.date ?? new Date().toISOString().slice(0, 10),
          keep_private: Boolean(o.private),
        };
        if (o.course) body.course_id = (await resolveCourse(o.course)).id;
        if (o.link) body.link_url = o.link;
        if (o.context) body.context_type = o.context;
        if (o.location) body.location = o.location;
        const created = await api.post<any>("/records", body);
        present(json, created, () => log.ok(`Created record ${created.id}.`));
      })
    );

  record
    .command("proof <id>")
    .description("Attach proof (a file or a link) to a record")
    .option("-f, --file <path>", "file to upload")
    .option("-l, --link <url>", "link URL to attach")
    .action(
      action(async function (this: Command, id: string) {
        const { json } = opts(this);
        const o = this.opts();
        if (!o.file && !o.link) throw new Error("Provide --file or --link.");
        const form = new FormData();
        if (o.file) {
          const buf = fs.readFileSync(o.file);
          form.append("file", new Blob([buf]), path.basename(o.file));
        }
        if (o.link) form.append("link_url", o.link);
        const result = await api.upload(`/records/${id}/proof`, form);
        present(json, result, () => log.ok("Proof attached."));
      })
    );

  record
    .command("delete <id>")
    .description("Delete a record")
    .action(
      action(async function (this: Command, id: string) {
        const { json } = opts(this);
        const result = await api.del(`/records/${id}`);
        present(json, result ?? { ok: true }, () => log.ok(`Deleted record ${id}.`));
      })
    );
}
