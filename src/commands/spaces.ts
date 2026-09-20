import { Command } from "commander";
import { action, opts } from "../core/run.js";
import { api } from "../core/client.js";
import { studentUid, present, resolveBodyField, endpointHasField } from "../core/context.js";
import { c, log, table, truncate } from "../core/ui.js";

export function register(program: Command): void {
  const space = program.command("space").description("Personal spaces (hobbies, side projects, volunteering)");

  space
    .command("list")
    .description("List my spaces")
    .action(
      action(async function (this: Command) {
        const { json } = opts(this);
        const uid = studentUid();
        const items = await api.get<any[]>(`/student/${uid}/spaces`);
        present(json, items, () => {
          if (!items.length) return log.warn("No spaces yet.");
          log.info(
            table(
              ["id", "name", "type", "archived"],
              items.map((s) => [s.id, truncate(s.name, 34), s.space_type ?? "", s.archived ? "yes" : "no"])
            )
          );
        });
      })
    );

  space
    .command("create <name>")
    .description("Create a personal space")
    .option("--type <space_type>", "space type (e.g. hobby, project, volunteering)", "hobby")
    .action(
      action(async function (this: Command, name: string) {
        const { json } = opts(this);
        const o = this.opts();
        const uid = studentUid();
        const nameField = resolveBodyField("space.create", ["name"]);
        const body: Record<string, unknown> = { [nameField]: name };
        if (endpointHasField("space.create", "space_type")) body.space_type = o.type;
        const created = await api.post<any>(`/student/${uid}/spaces`, body);
        present(json, created, () => log.ok(`Created space "${name}".`));
      })
    );

  space
    .command("delete <spaceId>")
    .description("Delete a personal space")
    .action(
      action(async function (this: Command, spaceId: string) {
        const { json } = opts(this);
        const uid = studentUid();
        const r = await api.del(`/student/${uid}/spaces/${spaceId}`);
        present(json, r ?? { ok: true }, () => log.ok("Space deleted."));
      })
    );

  space
    .command("records <spaceId>")
    .description("List records in a space")
    .action(
      action(async function (this: Command, spaceId: string) {
        const { json } = opts(this);
        const uid = studentUid();
        const items = await api.get<any>(`/student/${uid}/spaces/${spaceId}/records`);
        present(json, items, () => log.info(JSON.stringify(items, null, 2)));
      })
    );
}
