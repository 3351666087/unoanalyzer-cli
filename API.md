# UnoAnalyzer Platform API

Reverse-engineered reference for the UnoAnalyzer learning-intelligence platform
(`https://cn.unoanalyzer.com`), scoped to the **ENT207TC — Digital Startup Lab**
student workflow. Verified live on 2026-09-20 against platform build `CJGwzuIP`.

> This documents the **China region** deployment (`/api/cn/*`), which uses
> **Supabase** authentication. The global deployment uses Firebase and an
> `/api` / `/api/v1` prefix; endpoint shapes are otherwise similar.
>
> The `uno` CLI in this repo can regenerate a full, current machine-readable
> catalogue at any time: `uno sync && uno endpoints --json`
> (see also [`skills/unoanalyzer/references/endpoints.md`](skills/unoanalyzer/references/endpoints.md), 323 endpoints).

---

## 1. Architecture

- **Frontend:** a Vite single-page app served under `/app/` (React + Radix +
  Recharts). Endpoints are code-split across ~190 JS chunks.
- **Backend:** REST under `https://cn.unoanalyzer.com/api/cn/*`.
- **Auth:** Supabase GoTrue, proxied on the same origin
  (`https://cn.unoanalyzer.com/auth/v1/*`).
- **Regions:** the client picks a prefix by `chinaFeatures`: `/api/cn` (China)
  vs `/api` or `/api/v1` (global).

### Config values (from the app bundle)

| Key | Value |
|-----|-------|
| `backendUrl` | `https://cn.unoanalyzer.com` |
| `supabaseUrl` | `https://cn.unoanalyzer.com` |
| `supabasePublishableKey` | `sb_publishable_BMWm1NOV4Mj8NoeLumuj1Y_0lbGpvBn` (public anon key) |
| API prefix | `/api/cn` |

---

## 2. Authentication

Supabase email/password. Two steps: get a token, then use it as a Bearer.

### 2.1 Sign in (password grant)

```http
POST https://cn.unoanalyzer.com/auth/v1/token?grant_type=password
Content-Type: application/json
apikey: sb_publishable_BMWm1NOV4Mj8NoeLumuj1Y_0lbGpvBn

{ "email": "you@student.xjtlu.edu.cn", "password": "••••••" }
```

Response:

```json
{ "access_token": "eyJ…", "refresh_token": "…", "expires_in": 3600, "token_type": "bearer", "user": { … } }
```

`access_token` is an ES256 JWT; `sub` is the user's UID and `exp` is the expiry.

### 2.2 Refresh

```http
POST https://cn.unoanalyzer.com/auth/v1/token?grant_type=refresh_token
Content-Type: application/json
apikey: sb_publishable_BMWm1NOV4Mj8NoeLumuj1Y_0lbGpvBn

{ "refresh_token": "…" }
```

Refresh tokens rotate on each use — persist the new one. This is what enables
"log in once": refresh before `exp`, and only re-enter the password if the
refresh token is revoked.

### 2.3 Authenticated requests

```http
GET https://cn.unoanalyzer.com/api/cn/me
Authorization: Bearer <access_token>
```

Optional header `X-Uno-Preview-As: <studentUid>` lets staff view as a student.

### 2.4 Signup / onboarding (for reference)

- `POST /api/cn/auth/signup` `{ full_name, email, password }`
- `PATCH /api/cn/auth/onboard` `{ role, full_name }`
- `GET /api/cn/auth/terms-status`, `POST /api/cn/auth/accept-terms`,
  `POST /api/cn/auth/research-consent`

### 2.5 Errors

Non-2xx responses carry a JSON body; the message is in `detail` (fallbacks:
`error_description`, `msg`, `message`, `error`). Example:

```json
{ "detail": "Course staff only." }
```

Common statuses: `401` (bad/absent token), `403` (role not permitted — several
endpoints are staff-only), `404`, `405`, `422` (validation), `5xx`.

---

## 3. Identity

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/cn/me` | Current user profile. |
| GET | `/api/cn/student/me/tier` | Account tier + linked courses/institution. |
| GET | `/api/cn/me/onboarding` | Onboarding flags. |
| POST | `/api/cn/me/heartbeat` | Presence ping. |
| POST | `/api/cn/me/change-password` | Change password. |
| GET | `/api/cn/me/nudges` | Nudges addressed to me. |
| POST | `/api/cn/nudges/{nudgeId}/seen` | Mark a nudge seen. |

`GET /api/cn/me` →

```json
{
  "uid": "<uid>", "email": "student@student.xjtlu.edu.cn",
  "fullName": "Student Name", "role": "student",
  "isModuleLeader": false, "isCourseStaff": false, "isVerified": true,
  "language": "zh-CN", "studentOnboardingCompleted": true,
  "termsAcceptedVersion": "2026-09-02", "researchConsent": true
}
```

`GET /api/cn/student/me/tier` →

```json
{ "account_tier": "course_linked", "linked_courses": ["ent207tc_2026"], "linked_institution": "XJTLU", "linked_at": null }
```

---

## 4. Courses

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/cn/student/{studentUid}/courses` | My courses (with nested assessments). |
| GET | `/api/cn/courses/{courseId}` | Full course detail. |
| POST | `/api/cn/courses/join` | Join a course — body `{ code }`. |
| GET | `/api/cn/courses/code/{code}/preview` | Preview a course by join code. |
| GET | `/api/cn/courses/{courseId}/verification-layers` | Evidence verification layers. |
| GET | `/api/cn/courses/{courseId}/proof-activity` | Recent evidence in the course. |
| GET | `/api/cn/courses/{courseId}/messages` | Course broadcast messages. |
| GET | `/api/cn/courses/{courseId}/surveys/open` | Open staff surveys. |
| POST | `/api/cn/courses/{courseId}/surveys/{surveyId}/responses` | Submit a survey response. |
| GET | `/api/cn/courses/{courseId}/my-mentor` | My assigned mentor. |
| GET | `/api/cn/courses/{courseId}/my-brief` | Mentor brief for me. |
| GET | `/api/cn/courses/{courseId}/handbook` | Handbook brief. |

`GET /api/cn/courses/{courseId}` returns (abridged):

```jsonc
{
  "id": "ent207tc_2026", "code": "ENT207TC", "name": "Digital Startup Lab",
  "instructorEmail": "instructor@xjtlu.edu.cn",
  "studentCount": 952, "evidenceCount": 431,
  "currentWeek": 2, "totalWeeks": 11, "startDate": "…", "skipWeeks": [],
  "taUids": ["…"], "mentorUids": ["…"], "coInstructorUids": [],
  "assessments": [
    { "id": "draft1_digital_prototype", "name": "Digital Prototype Report",
      "type": "other", "weight": 0, "dueWeek": 4, "component": "…",
      "drafts": [ { "id": "aa67af24e9b1", "number": 1, "title": "…" } ],
      "checkpoints": [], "milestones": [], "rubric_criteria": [] }
  ],
  "milestones": [
    { "id": "e83162622ae3", "number": 1, "title": "…", "dueWeek": 1,
      "kind": "…", "component": "…", "assessed": false, "mission": "…",
      "steps": [], "submitChecklist": [], "whatGoodLooksLike": "…",
      "commonMistakes": [] }
  ],
  "sessions": [ { "id": "31c9233fc0ca", "label": "Friday morning",
      "dayOfWeek": "…", "startTime": "…", "endTime": "…", "location": "…" } ],
  "contextMaterials": [ { "id": "…", "kind": "…", "fileName": "…",
      "fileSize": 12345, "url": "…", "objectKey": "…" } ],
  "componentWeights": { "demo_day": 0, "reflection": 0, "weekly_process": 0, "final_deliverables": 0 }
}
```

---

## 5. Groups

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/cn/courses/{courseId}/groups` | All groups (find yours via `memberUids`). |
| POST | `/api/cn/courses/{courseId}/groups` | Create a group. |
| DELETE | `/api/cn/courses/{courseId}/groups/{groupId}` | Delete a group. |
| GET | `/api/cn/groups/{groupId}/activity` | Activity feed. |
| GET | `/api/cn/groups/{groupId}/student-activity` | Per-student contribution. |
| POST | `/api/cn/groups/{groupId}/contribution-read` | Mark contributions read. |
| GET | `/api/cn/groups/{groupId}/milestone-completions` | Milestone completion state. |
| POST | `/api/cn/groups/{groupId}/milestone-completions/{milestoneId}/toggle` | Toggle a milestone. |
| PATCH | `/api/cn/groups/{groupId}/name` | Rename — `{ name }`. |
| PUT | `/api/cn/groups/{groupId}/project` | Set the group's project. |
| POST | `/api/cn/groups/{groupId}/invite` | Invite a member. |
| POST | `/api/cn/groups/{groupId}/leave?course_id=…` | Leave the group. |
| PUT | `/api/cn/groups/{groupId}/leader` | Set the leader. |
| POST | `/api/cn/groups/{groupId}/tasks` | Add a task. |
| DELETE | `/api/cn/groups/{groupId}/tasks/{taskId}` | Remove a task. |
| POST | `/api/cn/groups/{groupId}/files` | Upload a file (multipart `file`). |
| DELETE | `/api/cn/groups/{groupId}/files/{fileId}` | Delete a file. |

`GET /api/cn/courses/{courseId}/groups` → array of:

```json
{ "id": "<groupId>", "courseId": "ent207tc_2026", "name": "Team Name",
  "number": 31, "sessionId": "…", "creatorUid": "…",
  "memberUids": ["…"] }
```

`GET /api/cn/groups/{groupId}/activity` → `{ "groupId": "…", "entries": [ { "id": "…", "type": "proof|task|…", "authorUid": "…", "text": "…", "at": "ISO-8601" } ] }`

---

## 6. Weekly logs

Per-group, per-week. `week` is an integer.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/cn/courses/{courseId}/groups/{groupId}/weekly-logs` | All weeks → `{ logs: [] }`. |
| GET | `/api/cn/courses/{courseId}/groups/{groupId}/weekly-logs/{week}` | One week (or null). |
| PUT | `/api/cn/courses/{courseId}/groups/{groupId}/weekly-logs/{week}` | Set the whole group's log. |
| PUT | `/api/cn/courses/{courseId}/groups/{groupId}/weekly-logs/{week}/my-entry` | Submit MY entry (body = entry object). |
| POST | `…/weekly-logs/{week}/screenshot` | Attach screenshot (multipart `file`). |
| DELETE | `…/weekly-logs/{week}/screenshot?key=…` | Delete a screenshot by key. |

---

## 7. Records (evidence)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/cn/records` | My records. |
| POST | `/api/cn/records` | Create a record. |
| GET | `/api/cn/records/{recordId}` | One record + matched sub-capabilities. |
| DELETE | `/api/cn/records/{recordId}` | Delete a record. |
| POST | `/api/cn/records/{recordId}/verify` | Verify (peer/staff). |
| POST | `/api/cn/records/{recordId}/proof` | Attach proof — multipart `file` OR field `link_url`. |
| DELETE | `/api/cn/records/{recordId}/proof?proof_index=N` | Remove a proof. |
| POST | `/api/cn/records/analyze-photo` | AI-suggest fields from a photo (multipart `file`). |

Create body:

```json
{ "title": "User interview", "description": "", "date": "2026-09-20",
  "course_id": "ent207tc_2026", "space_id": null, "context_type": null,
  "location": null, "link_url": null, "keep_private": false }
```

Returned record includes `id`, `proof_files[]`, `proof_urls[]`, `created_at`,
and (on GET by id) `matchedSubcapabilities[]`.

---

## 8. Capabilities & profile

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/cn/student/{studentUid}/capabilities?course_id=…` | Demonstrated capabilities. |
| GET | `/api/cn/student/{studentUid}/capability/{subCapId}/evidence` | Evidence for one sub-capability. |
| GET | `/api/cn/student/{studentUid}/narrative` | Narrative text + status. |
| POST | `/api/cn/student/{studentUid}/narrative/generate` | Generate narrative. |
| POST | `/api/cn/student/{studentUid}/narrative/approve` | Approve/publish narrative. |
| GET | `/api/cn/public/profile/{uid}` | Public verified profile. |

`capabilities` item:

```json
{ "subCapabilityId": "ai_ent207tc_2026_TEAM_3_12",
  "name": "Support teammates and share resources toward joint goals",
  "competencyId": "teamwork", "currentLevel": "emerging",
  "evidenceCount": 1, "reasoning": "…", "learningOutcomes": ["LO_1: …"] }
```

---

## 9. Spaces

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/cn/student/{studentUid}/spaces` | My personal spaces. |
| POST | `/api/cn/student/{studentUid}/spaces` | Create — `{ name }`. |
| DELETE | `/api/cn/student/{studentUid}/spaces/{spaceId}` | Delete. |
| GET | `/api/cn/student/{studentUid}/spaces/{spaceId}/records` | Records in a space. |
| POST | `/api/cn/student/{studentUid}/courses/{courseId}/ensure-space` | Ensure a course-linked space. |

---

## 10. Briefings & course assistant

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/cn/student/{studentUid}/briefing` | Weekly AI briefings across courses. |
| GET | `/api/cn/student/{studentUid}/course/{courseId}/chat/history` | Assistant history. |
| POST | `/api/cn/student/{studentUid}/course/{courseId}/chat` | Ask the assistant — `{ message }`. |

`briefing` item: `{ courseId, weekKey, currentWeek, greeting, what_next: [ … ], … }`.

---

## 11. Project proposals

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/cn/courses/{courseId}/project-requirements` | Requirements/rubric. |
| POST | `/api/cn/groups/{groupId}/proposals` | Create a proposal. |
| PATCH | `/api/cn/proposals/{proposalId}` | Update draft. |
| GET | `/api/cn/proposals/{proposalId}/feedback` | Feedback. |
| POST | `/api/cn/proposals/{proposalId}/submit` | Submit for review. |
| POST | `/api/cn/proposals/{proposalId}/files` | Attach a file (multipart). |

---

## 12. Staff-only (visible to students as 403)

For completeness — these require an instructor/TA/mentor role:
`/api/cn/courses/{courseId}/my-questions`, `.../mentor-questions`,
`.../message-history`, `.../mentor-briefs/send`, `.../activity-summary`,
`.../ai-usage`, plus the whole `faculty/*`, `admin/*`, `batches/*`,
`moderation/*`, `reports/*`, and `research/*` surfaces. Browse them with
`uno endpoints -c <category>`.

---

## 13. Misc

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/cn/to-english` | Translate text to English — `{ text }`. |
| POST | `/api/cn/upload/material` | Upload course material (multipart). |

---

*Generated as part of the `unoanalyzer-cli` project. Path parameters are shown
as `{name}`; the CLI's catalogue uses `:name`. Because the platform evolves,
treat `uno sync` output as authoritative over this static document.*
