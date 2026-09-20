import { loadSession } from "./session.js";
import { api } from "./client.js";
import { AuthRequiredError } from "./errors.js";
import { printJson, log } from "./ui.js";
import { loadManifest, findEndpoint } from "./manifest.js";
import type { UserProfile } from "../types.js";

export interface Course {
  id: string;
  code: string;
  name: string;
  currentWeek?: number;
  [k: string]: unknown;
}

export interface Group {
  id: string;
  name: string;
  number?: number;
  memberUids?: string[];
  [k: string]: unknown;
}

/** The signed-in user (from the local session). */
export function currentUser(): UserProfile {
  const s = loadSession();
  if (!s) throw new AuthRequiredError();
  return s.user;
}

export function studentUid(): string {
  return currentUser().uid;
}

/** Resolve a course by id (e.g. ent207tc_2026) or code (e.g. ENT207TC). */
export async function resolveCourse(idOrCode: string): Promise<Course> {
  const uid = studentUid();
  const data = await api.get<{ courses: Course[] }>(`/student/${uid}/courses`);
  const courses = data.courses ?? [];
  const needle = idOrCode.toLowerCase();
  const match =
    courses.find((c) => c.id.toLowerCase() === needle) ||
    courses.find((c) => c.code?.toLowerCase() === needle) ||
    courses.find((c) => c.id.toLowerCase().includes(needle) || c.code?.toLowerCase().includes(needle));
  if (!match) {
    throw new Error(
      `No joined course matches "${idOrCode}". Known: ${courses.map((c) => c.code || c.id).join(", ") || "(none)"}`
    );
  }
  return match;
}

/** The user's group within a course (found via memberUids), or null. */
export async function myGroup(courseId: string): Promise<Group | null> {
  const uid = studentUid();
  const groups = await api.get<Group[]>(`/courses/${courseId}/groups`);
  return (groups ?? []).find((g) => (g.memberUids ?? []).includes(uid)) ?? null;
}

/** Print either JSON (machine) or run the human renderer. */
export function present(json: boolean, data: unknown, human: () => void): void {
  if (json) printJson(data);
  else human();
}

/**
 * Pick the request-body field name to use for a convenience command, based on
 * the *current* manifest rather than a hardcoded literal — so the CLI keeps
 * working after `uno sync` if the platform renames a field.
 *
 * `candidates` are known aliases in preference order. If the endpoint's live
 * bodyFields contain one of them, that one is used. If none match but the
 * endpoint advertises exactly one unknown field, we adopt it (with a warning).
 * Otherwise we fall back to the first candidate.
 */
export function resolveBodyField(endpointId: string, candidates: string[]): string {
  const ep = findEndpoint(loadManifest(), endpointId);
  const fields = ep?.bodyFields ?? [];
  if (fields.length === 0) return candidates[0];
  for (const c of candidates) if (fields.includes(c)) return c;
  // Platform may have renamed the field. If there's a single plausible field,
  // adopt it; otherwise keep the expected name and let the caller/API report.
  const scalarish = fields.filter((f) => !/^(mode|history|signed|keep_private)$/.test(f));
  if (scalarish.length === 1) {
    log.warn(
      `Endpoint ${endpointId} field looks renamed (${candidates[0]} → ${scalarish[0]}); using "${scalarish[0]}". Run \`uno describe ${endpointId}\`.`
    );
    return scalarish[0];
  }
  log.warn(
    `Endpoint ${endpointId} no longer advertises "${candidates[0]}" (has: ${fields.join(", ") || "none"}). Using it anyway; try \`uno call ${endpointId} -d '{...}'\`.`
  );
  return candidates[0];
}

/** True when the current manifest says this endpoint accepts the given field. */
export function endpointHasField(endpointId: string, field: string): boolean {
  const ep = findEndpoint(loadManifest(), endpointId);
  // If we have no body info at all, don't block optional fields.
  if (!ep?.bodyFields || ep.bodyFields.length === 0) return true;
  return ep.bodyFields.includes(field);
}
