import { Command } from "commander";
import { action, opts } from "../core/run.js";
import { api } from "../core/client.js";
import { studentUid, resolveCourse, present, type Course } from "../core/context.js";
import { c, log, table, keyValue, truncate } from "../core/ui.js";

interface Assessment {
  id: string;
  name: string;
  type?: string;
  weight?: number;
  dueWeek?: number;
  drafts?: unknown[];
  milestones?: unknown[];
}
interface Milestone {
  id: string;
  number?: number;
  title: string;
  dueWeek?: number;
  kind?: string;
  mission?: string;
}

export function register(program: Command): void {
  program
    .command("courses")
    .description("List the courses you have joined")
    .action(
      action(async function (this: Command) {
        const { json } = opts(this);
        const uid = studentUid();
        const data = await api.get<{ courses: (Course & { assessments?: unknown[]; currentWeek?: number })[] }>(
          `/student/${uid}/courses`
        );
        const courses = data.courses ?? [];
        present(json, courses, () => {
          if (!courses.length) return log.warn("You have not joined any courses.");
          const rows = courses.map((co) => [
            c.bold(co.code || ""),
            truncate(co.name, 34),
            co.currentWeek ? `week ${co.currentWeek}` : "—",
            String((co.assessments ?? []).length) + " assessments",
            co.id,
          ]);
          log.info(table(["code", "name", "progress", "work", "id"], rows));
        });
      })
    );

  const course = program.command("course").description("Course details for ENT207TC etc.");

  course
    .command("show <idOrCode>")
    .description("Overview: weeks, sessions, assessments, milestones")
    .action(
      action(async function (this: Command, idOrCode: string) {
        const { json } = opts(this);
        const co = await resolveCourse(idOrCode);
        const detail = await api.get<any>(`/courses/${co.id}`);
        present(json, detail, () => {
          log.info(c.bold(`${detail.code}  ${detail.name}`));
          log.info(
            keyValue([
              ["Instructor", detail.instructorEmail],
              ["Students", detail.studentCount],
              ["Week", `${detail.currentWeek ?? "—"} / ${detail.totalWeeks ?? "—"}`],
              ["Assessments", (detail.assessments ?? []).length],
              ["Milestones", (detail.milestones ?? []).length],
              ["Evidence", detail.evidenceCount],
            ])
          );
          const sessions = detail.sessions ?? [];
          if (sessions.length) {
            log.info("\n" + c.bold("Sessions"));
            log.info(
              table(
                ["label", "day", "time", "location"],
                sessions.map((s: any) => [s.label ?? "", s.dayOfWeek ?? "", `${s.startTime ?? ""}-${s.endTime ?? ""}`, s.location ?? ""])
              )
            );
          }
          log.info("\n" + c.gray("More: uno course assessments " + co.code + " · uno course milestones " + co.code));
        });
      })
    );

  course
    .command("assessments <idOrCode>")
    .description("List assessments (with drafts/milestone counts)")
    .action(
      action(async function (this: Command, idOrCode: string) {
        const { json } = opts(this);
        const co = await resolveCourse(idOrCode);
        const detail = await api.get<{ assessments: Assessment[] }>(`/courses/${co.id}`);
        const items = detail.assessments ?? [];
        present(json, items, () => {
          if (!items.length) return log.warn("No assessments.");
          log.info(
            table(
              ["id", "name", "type", "weight", "due", "drafts"],
              items.map((a) => [
                a.id,
                truncate(a.name, 30),
                a.type ?? "",
                a.weight != null ? `${a.weight}%` : "",
                a.dueWeek ? `wk ${a.dueWeek}` : "",
                String((a.drafts ?? []).length),
              ])
            )
          );
        });
      })
    );

  course
    .command("milestones <idOrCode>")
    .description("List milestones with due weeks")
    .action(
      action(async function (this: Command, idOrCode: string) {
        const { json } = opts(this);
        const co = await resolveCourse(idOrCode);
        const detail = await api.get<{ milestones: Milestone[] }>(`/courses/${co.id}`);
        const items = (detail.milestones ?? []).sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
        present(json, items, () => {
          if (!items.length) return log.warn("No milestones.");
          log.info(
            table(
              ["#", "title", "kind", "due", "mission"],
              items.map((m) => [String(m.number ?? ""), truncate(m.title, 28), m.kind ?? "", m.dueWeek ? `wk ${m.dueWeek}` : "", truncate(m.mission, 40)])
            )
          );
        });
      })
    );

  course
    .command("materials <idOrCode>")
    .description("List syllabus / context materials")
    .action(
      action(async function (this: Command, idOrCode: string) {
        const { json } = opts(this);
        const co = await resolveCourse(idOrCode);
        const detail = await api.get<{ contextMaterials?: any[] }>(`/courses/${co.id}`);
        const items = detail.contextMaterials ?? [];
        present(json, items, () => {
          if (!items.length) return log.warn("No materials.");
          log.info(
            table(
              ["file", "kind", "size", "uploaded by"],
              items.map((m) => [truncate(m.fileName, 34), m.kind ?? "", m.fileSize ? `${Math.round(m.fileSize / 1024)}KB` : "", m.uploadedByName ?? ""])
            )
          );
        });
      })
    );

  course
    .command("join <code>")
    .description("Preview then join a course by its join code")
    .option("--yes", "skip the preview confirmation")
    .action(
      action(async function (this: Command, code: string) {
        const { json } = opts(this);
        const o = this.opts();
        const preview = await api.get<any>(`/courses/code/${encodeURIComponent(code)}/preview`).catch(() => null);
        if (preview && !json) {
          log.info(c.bold("Preview"));
          log.info(keyValue([["Course", preview.name ?? preview.code ?? code], ["Code", preview.code ?? code]]));
        }
        if (!o.yes && !json) {
          log.info(c.yellow(`\nRun again with --yes to join ${code}.`));
          return;
        }
        const result = await api.post(`/courses/join`, { code });
        present(json, result, () => log.ok(`Joined ${code}.`));
      })
    );
}
