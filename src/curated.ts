/**
 * Curated endpoint catalogue for the ENT207TC student workflow.
 *
 * These entries are hand-verified against the live cn.unoanalyzer.com backend
 * and carry human descriptions. They are always present (even before the first
 * `uno sync`) and are considered authoritative: when a discovered endpoint has
 * the same METHOD + path, the curated description/params win.
 *
 * Path params use readable names; `p` = path, `q` = query.
 */
import type { Endpoint } from "./types.js";

function p(name: string) {
  return { name, in: "path" as const, required: true };
}
function q(name: string, required = false) {
  return { name, in: "query" as const, required };
}

export const CURATED_ENDPOINTS: Endpoint[] = [
  // --- Identity ---------------------------------------------------------
  { id: "me.get", method: "GET", path: "/api/cn/me", category: "identity", params: [], source: "curated", description: "Current authenticated user profile." },
  { id: "me.tier", method: "GET", path: "/api/cn/student/me/tier", category: "identity", params: [], source: "curated", description: "Account tier and linked courses/institution." },
  { id: "me.onboarding", method: "GET", path: "/api/cn/me/onboarding", category: "identity", params: [], source: "curated", description: "Onboarding completion state." },
  { id: "me.heartbeat", method: "POST", path: "/api/cn/me/heartbeat", category: "identity", params: [], source: "curated", description: "Presence heartbeat." },
  { id: "me.nudges", method: "GET", path: "/api/cn/me/nudges", category: "identity", params: [], source: "curated", description: "Nudges addressed to me." },
  { id: "me.nudgeSeen", method: "POST", path: "/api/cn/nudges/:nudgeId/seen", category: "identity", params: [p("nudgeId")], source: "curated", description: "Mark a nudge as seen." },

  // --- Courses ----------------------------------------------------------
  { id: "courses.list", method: "GET", path: "/api/cn/student/:studentUid/courses", category: "courses", params: [p("studentUid")], source: "curated", description: "Courses I have joined (with nested assessments)." },
  { id: "course.detail", method: "GET", path: "/api/cn/courses/:courseId", category: "courses", params: [p("courseId")], source: "curated", description: "Full course detail: assessments, milestones, sessions, materials, weights." },
  { id: "course.join", method: "POST", path: "/api/cn/courses/join", category: "courses", params: [], bodyFields: ["course_code"], source: "curated", description: "Join a course. Body: { course_code }." },
  { id: "course.previewCode", method: "GET", path: "/api/cn/courses/code/:code/preview", category: "courses", params: [p("code")], source: "curated", description: "Preview a course from its join code before joining." },
  { id: "course.verificationLayers", method: "GET", path: "/api/cn/courses/:courseId/verification-layers", category: "courses", params: [p("courseId")], source: "curated", description: "Enabled and available evidence verification layers." },
  { id: "course.proofActivity", method: "GET", path: "/api/cn/courses/:courseId/proof-activity", category: "courses", params: [p("courseId")], source: "curated", description: "Recent evidence/proof activity across the course." },
  { id: "course.messages", method: "GET", path: "/api/cn/courses/:courseId/messages", category: "courses", params: [p("courseId")], source: "curated", description: "Course broadcast messages." },
  { id: "course.surveysOpen", method: "GET", path: "/api/cn/courses/:courseId/surveys/open", category: "courses", params: [p("courseId")], source: "curated", description: "Currently open staff surveys." },
  { id: "course.surveyRespond", method: "POST", path: "/api/cn/courses/:courseId/surveys/:surveyId/responses", category: "courses", params: [p("courseId"), p("surveyId")], source: "curated", description: "Submit a response to an open survey." },
  { id: "course.myMentor", method: "GET", path: "/api/cn/courses/:courseId/my-mentor", category: "courses", params: [p("courseId")], source: "curated", description: "My assigned mentor and their office hours." },
  { id: "course.myBrief", method: "GET", path: "/api/cn/courses/:courseId/my-brief", category: "courses", params: [p("courseId")], source: "curated", description: "The mentor brief addressed to me/my group." },
  { id: "course.handbook", method: "GET", path: "/api/cn/courses/:courseId/handbook", category: "courses", params: [p("courseId")], source: "curated", description: "Course handbook brief." },

  // --- Briefings & assistant -------------------------------------------
  { id: "briefing.get", method: "GET", path: "/api/cn/student/:studentUid/briefing", category: "briefing", params: [p("studentUid")], source: "curated", description: "Weekly AI briefings across my courses." },
  { id: "chat.history", method: "GET", path: "/api/cn/student/:studentUid/course/:courseId/chat/history", category: "assistant", params: [p("studentUid"), p("courseId")], source: "curated", description: "Course assistant chat history." },
  { id: "chat.send", method: "POST", path: "/api/cn/student/:studentUid/course/:courseId/chat", category: "assistant", params: [p("studentUid"), p("courseId")], bodyFields: ["message", "mode", "history"], source: "curated", description: "Ask the course assistant. Body: { message, mode?(assistant|socratic), history? }; reply in .response." },

  // --- Groups -----------------------------------------------------------
  { id: "groups.list", method: "GET", path: "/api/cn/courses/:courseId/groups", category: "groups", params: [p("courseId")], source: "curated", description: "All groups in a course (find mine by memberUids)." },
  { id: "group.create", method: "POST", path: "/api/cn/courses/:courseId/groups", category: "groups", params: [p("courseId")], source: "curated", description: "Create a group in a course." },
  { id: "group.delete", method: "DELETE", path: "/api/cn/courses/:courseId/groups/:groupId", category: "groups", params: [p("courseId"), p("groupId")], source: "curated", description: "Delete a group." },
  { id: "group.activity", method: "GET", path: "/api/cn/groups/:groupId/activity", category: "groups", params: [p("groupId")], source: "curated", description: "Group activity feed (proofs, tasks, milestones)." },
  { id: "group.studentActivity", method: "GET", path: "/api/cn/groups/:groupId/student-activity", category: "groups", params: [p("groupId")], source: "curated", description: "Per-student contribution activity in a group." },
  { id: "group.contributionRead", method: "POST", path: "/api/cn/groups/:groupId/contribution-read", category: "groups", params: [p("groupId")], source: "curated", description: "Mark contribution activity as read." },
  { id: "group.milestoneCompletions", method: "GET", path: "/api/cn/groups/:groupId/milestone-completions", category: "groups", params: [p("groupId")], source: "curated", description: "Milestone completion state for a group." },
  { id: "group.toggleMilestone", method: "POST", path: "/api/cn/groups/:groupId/milestone-completions/:milestoneId/toggle", category: "groups", params: [p("groupId"), p("milestoneId")], source: "curated", description: "Toggle a milestone's completion." },
  { id: "group.rename", method: "PATCH", path: "/api/cn/groups/:groupId/name", category: "groups", params: [p("groupId")], bodyFields: ["name"], source: "curated", description: "Rename a group. Body: { name }." },
  { id: "group.setProject", method: "PUT", path: "/api/cn/groups/:groupId/project", category: "groups", params: [p("groupId")], source: "curated", description: "Set/choose the group's project." },
  { id: "group.invite", method: "POST", path: "/api/cn/groups/:groupId/invite", category: "groups", params: [p("groupId")], bodyFields: ["email"], source: "curated", description: "Invite a member to the group. Body: { email }." },
  { id: "group.leave", method: "POST", path: "/api/cn/groups/:groupId/leave", category: "groups", params: [p("groupId"), q("course_id", true)], source: "curated", description: "Leave a group." },
  { id: "group.setLeader", method: "PUT", path: "/api/cn/groups/:groupId/leader", category: "groups", params: [p("groupId")], source: "curated", description: "Set the group leader." },
  { id: "group.taskAdd", method: "POST", path: "/api/cn/groups/:groupId/tasks", category: "groups", params: [p("groupId")], bodyFields: ["title", "internal_deadline"], source: "curated", description: "Add a task. Body: { title, internal_deadline? }." },
  { id: "group.taskUpdate", method: "PATCH", path: "/api/cn/groups/:groupId/tasks/:taskId", category: "groups", params: [p("groupId"), p("taskId")], bodyFields: ["status", "internal_deadline"], source: "curated", description: "Update a task (partial). Body: { status?(not_started|on_track|ahead|behind|done), internal_deadline? }." },
  { id: "group.taskRemove", method: "DELETE", path: "/api/cn/groups/:groupId/tasks/:taskId", category: "groups", params: [p("groupId"), p("taskId")], source: "curated", description: "Remove a task." },
  { id: "group.fileUpload", method: "POST", path: "/api/cn/groups/:groupId/files", category: "groups", params: [p("groupId")], multipart: true, source: "curated", description: "Upload a file to the group (multipart 'file')." },
  { id: "group.fileRemove", method: "DELETE", path: "/api/cn/groups/:groupId/files/:fileId", category: "groups", params: [p("groupId"), p("fileId")], source: "curated", description: "Delete a group file." },

  // --- Weekly logs ------------------------------------------------------
  { id: "weeklyLog.list", method: "GET", path: "/api/cn/courses/:courseId/groups/:groupId/weekly-logs", category: "weekly-log", params: [p("courseId"), p("groupId")], source: "curated", description: "All weekly logs for a group. Returns { logs }." },
  { id: "weeklyLog.get", method: "GET", path: "/api/cn/courses/:courseId/groups/:groupId/weekly-logs/:week", category: "weekly-log", params: [p("courseId"), p("groupId"), p("week")], source: "curated", description: "A single week's log entry." },
  { id: "weeklyLog.setGroup", method: "PUT", path: "/api/cn/courses/:courseId/groups/:groupId/weekly-logs/:week", category: "weekly-log", params: [p("courseId"), p("groupId"), p("week")], bodyFields: ["teamName", "sessionGroupTable", "members", "kanbanStatus", "proofUploaded", "summaryOfWork", "challenges", "helpRequested", "supportOutcome"], source: "curated", description: "Set the whole group's weekly log. Body: { summaryOfWork, challenges, helpRequested, supportOutcome, ... }." },
  { id: "weeklyLog.myEntry", method: "PUT", path: "/api/cn/courses/:courseId/groups/:groupId/weekly-logs/:week/my-entry", category: "weekly-log", params: [p("courseId"), p("groupId"), p("week")], bodyFields: ["reflection", "signed"], source: "curated", description: "Submit/update MY entry for a week. Body: { reflection, signed }." },
  { id: "weeklyLog.screenshotUpload", method: "POST", path: "/api/cn/courses/:courseId/groups/:groupId/weekly-logs/:week/screenshot", category: "weekly-log", params: [p("courseId"), p("groupId"), p("week")], multipart: true, source: "curated", description: "Attach a screenshot to a weekly log (multipart 'file')." },
  { id: "weeklyLog.screenshotDelete", method: "DELETE", path: "/api/cn/courses/:courseId/groups/:groupId/weekly-logs/:week/screenshot", category: "weekly-log", params: [p("courseId"), p("groupId"), p("week"), q("key", true)], source: "curated", description: "Delete a weekly-log screenshot by storage key." },

  // --- Records (evidence) ----------------------------------------------
  { id: "records.list", method: "GET", path: "/api/cn/records", category: "records", params: [], source: "curated", description: "My evidence records." },
  { id: "records.create", method: "POST", path: "/api/cn/records", category: "records", params: [], bodyFields: ["title", "description", "date", "space", "space_id", "course_id", "context_type", "location", "link_url", "keep_private"], source: "curated", description: "Create a record. Body: { title, description?, date, course_id?, space_id?, context_type?, location?, link_url?, keep_private? }." },
  { id: "records.get", method: "GET", path: "/api/cn/records/:recordId", category: "records", params: [p("recordId")], source: "curated", description: "Get a record with matched sub-capabilities." },
  { id: "records.delete", method: "DELETE", path: "/api/cn/records/:recordId", category: "records", params: [p("recordId")], source: "curated", description: "Delete a record." },
  { id: "records.verify", method: "POST", path: "/api/cn/records/:recordId/verify", category: "records", params: [p("recordId")], source: "curated", description: "Verify a record (peer/staff)." },
  { id: "records.proofUpload", method: "POST", path: "/api/cn/records/:recordId/proof", category: "records", params: [p("recordId")], multipart: true, source: "curated", description: "Attach proof: multipart 'file', or form field 'link_url'." },
  { id: "records.proofDelete", method: "DELETE", path: "/api/cn/records/:recordId/proof", category: "records", params: [p("recordId"), q("proof_index", true)], source: "curated", description: "Remove an attached proof by index." },
  { id: "records.analyzePhoto", method: "POST", path: "/api/cn/records/analyze-photo", category: "records", params: [], multipart: true, source: "curated", description: "AI-suggest title/description/date/location from a photo (multipart 'file')." },

  // --- Capabilities & profile ------------------------------------------
  { id: "capabilities.list", method: "GET", path: "/api/cn/student/:studentUid/capabilities", category: "capabilities", params: [p("studentUid"), q("course_id")], source: "curated", description: "Demonstrated capabilities with levels and evidence counts." },
  { id: "capability.evidence", method: "GET", path: "/api/cn/student/:studentUid/capability/:subCapId/evidence", category: "capabilities", params: [p("studentUid"), p("subCapId")], source: "curated", description: "Evidence backing one sub-capability." },
  { id: "narrative.get", method: "GET", path: "/api/cn/student/:studentUid/narrative", category: "capabilities", params: [p("studentUid")], source: "curated", description: "My capability narrative (text + status)." },
  { id: "narrative.generate", method: "POST", path: "/api/cn/student/:studentUid/narrative/generate", category: "capabilities", params: [p("studentUid")], source: "curated", description: "Generate a capability narrative." },
  { id: "narrative.approve", method: "POST", path: "/api/cn/student/:studentUid/narrative/approve", category: "capabilities", params: [p("studentUid")], source: "curated", description: "Approve/publish the generated narrative." },
  { id: "profile.public", method: "GET", path: "/api/cn/public/profile/:uid", category: "capabilities", params: [p("uid")], source: "curated", description: "Public verified profile for a user." },

  // --- Spaces -----------------------------------------------------------
  { id: "spaces.list", method: "GET", path: "/api/cn/student/:studentUid/spaces", category: "spaces", params: [p("studentUid")], source: "curated", description: "My personal spaces." },
  { id: "space.create", method: "POST", path: "/api/cn/student/:studentUid/spaces", category: "spaces", params: [p("studentUid")], bodyFields: ["name", "space_type"], source: "curated", description: "Create a personal space. Body: { name, space_type } (space_type defaults to 'hobby')." },
  { id: "space.delete", method: "DELETE", path: "/api/cn/student/:studentUid/spaces/:spaceId", category: "spaces", params: [p("studentUid"), p("spaceId")], source: "curated", description: "Delete a personal space." },
  { id: "space.records", method: "GET", path: "/api/cn/student/:studentUid/spaces/:spaceId/records", category: "spaces", params: [p("studentUid"), p("spaceId")], source: "curated", description: "Records inside a space." },
  { id: "space.ensureForCourse", method: "POST", path: "/api/cn/student/:studentUid/courses/:courseId/ensure-space", category: "spaces", params: [p("studentUid"), p("courseId")], source: "curated", description: "Ensure a course-linked space exists." },

  // --- Project proposals ------------------------------------------------
  { id: "proposals.requirements", method: "GET", path: "/api/cn/courses/:courseId/project-requirements", category: "proposals", params: [p("courseId")], source: "curated", description: "Project requirements/rubric for the course." },
  { id: "proposals.create", method: "POST", path: "/api/cn/groups/:groupId/proposals", category: "proposals", params: [p("groupId")], source: "curated", description: "Create a project proposal for a group." },
  { id: "proposals.update", method: "PATCH", path: "/api/cn/proposals/:proposalId", category: "proposals", params: [p("proposalId")], source: "curated", description: "Update a proposal draft." },
  { id: "proposals.feedback", method: "GET", path: "/api/cn/proposals/:proposalId/feedback", category: "proposals", params: [p("proposalId")], source: "curated", description: "Feedback on a proposal." },
  { id: "proposals.submit", method: "POST", path: "/api/cn/proposals/:proposalId/submit", category: "proposals", params: [p("proposalId")], source: "curated", description: "Submit a proposal for review." },
  { id: "proposals.fileUpload", method: "POST", path: "/api/cn/proposals/:proposalId/files", category: "proposals", params: [p("proposalId")], multipart: true, source: "curated", description: "Attach a file to a proposal (multipart)." },

  // --- Misc helpers -----------------------------------------------------
  { id: "toEnglish", method: "POST", path: "/api/cn/to-english", category: "misc", params: [], bodyFields: ["items"], source: "curated", description: "Translate to English. Body: { items: [{ key, text }] }; result in .english." },
];
