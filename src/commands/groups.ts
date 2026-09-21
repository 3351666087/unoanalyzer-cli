import { Command } from "commander";
import { action, opts } from "../core/run.js";
import { api } from "../core/client.js";
import { resolveCourse, myGroup, present, resolveBodyField, endpointHasField } from "../core/context.js";
import { c, log, table, keyValue, truncate } from "../core/ui.js";

async function requireGroup(idOrCode: string) {
  const co = await resolveCourse(idOrCode);
  const group = await myGroup(co.id);
  if (!group) throw new Error(`You are not in a group in ${co.code}.`);
  return { co, group };
}

export function register(program: Command): void {
  const group = program.command("group").description("Your project group in a course");

  group
    .command("show <idOrCode>")
    .description("Show your group in a course")
    .action(
      action(async function (this: Command, idOrCode: string) {
        const { json } = opts(this);
        const { co, group } = await requireGroup(idOrCode);
        const mentor = await api.get<any>(`/courses/${co.id}/my-mentor`).catch(() => null);
        present(json, { group, mentor }, () => {
          log.info(c.bold(`${group.name}  ${group.number ? "#" + group.number : ""}`));
          log.info(
            keyValue([
              ["Group id", group.id],
              ["Members", (group.memberUids ?? []).length],
              ["Mentor", mentor?.mentor?.name ?? "—"],
              ["Session", (group as any).sessionId ?? "—"],
            ])
          );
        });
      })
    );

  group
    .command("activity <idOrCode>")
    .description("Recent group activity feed")
    .action(
      action(async function (this: Command, idOrCode: string) {
        const { json } = opts(this);
        const { group } = await requireGroup(idOrCode);
        const feed = await api.get<{ entries: any[] }>(`/groups/${group.id}/activity`);
        const entries = feed.entries ?? [];
        present(json, entries, () => {
          if (!entries.length) return log.warn("No activity yet.");
          log.info(
            table(
              ["when", "type", "text"],
              entries.slice(0, 40).map((e) => [new Date(e.at).toLocaleString(), e.type, truncate(e.text, 50)])
            )
          );
        });
      })
    );

  group
    .command("members <idOrCode>")
    .description("List group members")
    .action(
      action(async function (this: Command, idOrCode: string) {
        const { json } = opts(this);
        const { co, group } = await requireGroup(idOrCode);
        const proof = await api.get<{ records: any[] }>(`/courses/${co.id}/proof-activity`).catch(() => ({ records: [] }));
        const names = new Map<string, string>();
        for (const r of proof.records ?? []) if (r.studentUid) names.set(r.studentUid, r.studentName);
        const members = (group.memberUids ?? []).map((uid) => ({ uid, name: names.get(uid) ?? null }));
        present(json, members, () => {
          log.info(table(["uid", "name"], members.map((m) => [m.uid, m.name ?? c.dim("(unknown)")])));
        });
      })
    );

  group
    .command("milestones <idOrCode>")
    .description("Group milestone completion state")
    .action(
      action(async function (this: Command, idOrCode: string) {
        const { json } = opts(this);
        const { group } = await requireGroup(idOrCode);
        const items = await api.get<any[]>(`/groups/${group.id}/milestone-completions`);
        present(json, items, () => {
          if (!items.length) return log.warn("No milestone completions recorded.");
          log.info(
            table(
              ["milestoneId", "completedBy", "completedAt"],
              items.map((m) => [m.milestoneId, String((m.completedByUids ?? []).length), m.completedAt ? new Date(m.completedAt).toLocaleDateString() : "—"])
            )
          );
        });
      })
    );

  group
    .command("toggle-milestone <idOrCode> <milestoneId>")
    .description("Toggle a milestone completion for your group")
    .action(
      action(async function (this: Command, idOrCode: string, milestoneId: string) {
        const { json } = opts(this);
        const { group } = await requireGroup(idOrCode);
        const result = await api.post(`/groups/${group.id}/milestone-completions/${milestoneId}/toggle`);
        present(json, result, () => log.ok(`Toggled milestone ${milestoneId}.`));
      })
    );

  // Friendly Kanban-column aliases → backend task status values.
  const STATUS_ALIASES: Record<string, string> = {
    todo: "not_started",
    not_started: "not_started",
    backlog: "not_started",
    doing: "on_track",
    in_progress: "on_track",
    inprogress: "on_track",
    on_track: "on_track",
    ahead: "ahead",
    behind: "behind",
    done: "done",
    complete: "done",
    completed: "done",
  };

  group
    .command("task-move <idOrCode> <taskId> <status>")
    .description("Move a task card (status: not_started|on_track|ahead|behind|done, or todo/doing/done)")
    .action(
      action(async function (this: Command, idOrCode: string, taskId: string, status: string) {
        const { json } = opts(this);
        const { group } = await requireGroup(idOrCode);
        const mapped = STATUS_ALIASES[status.toLowerCase()] ?? status;
        const field = resolveBodyField("group.taskUpdate", ["status"]);
        const result = await api.patch(`/groups/${group.id}/tasks/${taskId}`, { [field]: mapped });
        present(json, result, () => log.ok(`Moved task ${taskId} → ${mapped}.`));
      })
    );

  group
    .command("task-deadline <idOrCode> <taskId> <date>")
    .description("Set a task's internal deadline (ISO date, e.g. 2026-10-01)")
    .action(
      action(async function (this: Command, idOrCode: string, taskId: string, date: string) {
        const { json } = opts(this);
        const { group } = await requireGroup(idOrCode);
        // Partial update via PATCH (the backend rejects PUT on this path).
        const field = resolveBodyField("group.taskUpdate", ["internal_deadline", "dueDate"]);
        const result = await api.patch(`/groups/${group.id}/tasks/${taskId}`, { [field]: date });
        present(json, result, () => log.ok(`Set deadline for task ${taskId} → ${date}.`));
      })
    );

  group
    .command("task-remove <idOrCode> <taskId>")
    .description("Remove a task from your group")
    .action(
      action(async function (this: Command, idOrCode: string, taskId: string) {
        const { json } = opts(this);
        const { group } = await requireGroup(idOrCode);
        const result = await api.del(`/groups/${group.id}/tasks/${taskId}`);
        present(json, result ?? { ok: true }, () => log.ok(`Removed task ${taskId}.`));
      })
    );

  group
    .command("task-add <idOrCode> <title>")
    .description("Add a task to your group")
    .option("--deadline <date>", "internal deadline (ISO date)")
    .action(
      action(async function (this: Command, idOrCode: string, title: string) {
        const { json } = opts(this);
        const o = this.opts();
        const { group } = await requireGroup(idOrCode);
        // Field name comes from the live manifest, not a hardcoded literal.
        const titleField = resolveBodyField("group.taskAdd", ["title", "text", "name"]);
        const body: Record<string, unknown> = { [titleField]: title };
        if (o.deadline && endpointHasField("group.taskAdd", "internal_deadline")) {
          body.internal_deadline = o.deadline;
        }
        const result = await api.post(`/groups/${group.id}/tasks`, body);
        present(json, result, () => log.ok("Task added."));
      })
    );
}
