import { Command } from "commander";
import { action, opts } from "../core/run.js";
import { api } from "../core/client.js";
import { resolveCourse, myGroup, present } from "../core/context.js";
import { c, log } from "../core/ui.js";

export function register(program: Command): void {
  const proposal = program.command("proposal").description("Project proposals");

  proposal
    .command("requirements <idOrCode>")
    .description("Show the course project requirements")
    .action(
      action(async function (this: Command, idOrCode: string) {
        const { json } = opts(this);
        const co = await resolveCourse(idOrCode);
        const data = await api.get<any>(`/courses/${co.id}/project-requirements`);
        present(json, data, () => {
          log.info(c.bold(`Project requirements · ${co.code}`));
          if (data.domain_note) log.info("\n" + data.domain_note);
          else log.info(JSON.stringify(data, null, 2));
        });
      })
    );

  proposal
    .command("create <idOrCode>")
    .description("Create a project proposal for your group")
    .requiredOption("-d, --data <json>", "proposal fields as JSON")
    .action(
      action(async function (this: Command, idOrCode: string) {
        const { json } = opts(this);
        const o = this.opts();
        let body: unknown;
        try {
          body = JSON.parse(o.data);
        } catch {
          throw new Error("--data must be valid JSON");
        }
        const co = await resolveCourse(idOrCode);
        const group = await myGroup(co.id);
        if (!group) throw new Error(`You are not in a group in ${co.code}.`);
        const created = await api.post<any>(`/groups/${group.id}/proposals`, body);
        present(json, created, () => log.ok(`Created proposal ${created.id ?? ""}.`));
      })
    );

  proposal
    .command("feedback <proposalId>")
    .description("Show feedback on a proposal")
    .action(
      action(async function (this: Command, proposalId: string) {
        const { json } = opts(this);
        const data = await api.get<any>(`/proposals/${proposalId}/feedback`);
        present(json, data, () => log.info(JSON.stringify(data, null, 2)));
      })
    );

  proposal
    .command("submit <proposalId>")
    .description("Submit a proposal for review")
    .action(
      action(async function (this: Command, proposalId: string) {
        const { json } = opts(this);
        const r = await api.post(`/proposals/${proposalId}/submit`);
        present(json, r, () => log.ok("Proposal submitted."));
      })
    );
}
