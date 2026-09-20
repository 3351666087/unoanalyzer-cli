import { loadSession } from "./session.js";
import { api } from "./client.js";
import { AuthRequiredError } from "./errors.js";
import { printJson } from "./ui.js";
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
