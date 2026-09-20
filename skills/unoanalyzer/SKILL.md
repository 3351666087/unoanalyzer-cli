---
name: unoanalyzer
description: >-
  Operate the UnoAnalyzer learning-intelligence platform (cn.unoanalyzer.com) for
  the ENT207TC "Digital Startup Lab" course from the command line via the `uno`
  CLI. Use whenever the user wants to read or manage their UnoAnalyzer courses,
  groups, weekly logs, evidence records, capabilities/narrative, project
  proposals, mentor briefings, or the course AI assistant — or to call any
  platform API endpoint. The CLI self-updates its endpoint catalogue, so this
  skill can drive new endpoints as the platform evolves.
---

# UnoAnalyzer CLI skill

`uno` is a self-updating command-line client for the UnoAnalyzer platform
(`cn.unoanalyzer.com`), built around the **ENT207TC** student workflow. It signs
in once (Supabase auth, auto-refreshing session) and keeps a live catalogue of
the platform's API so you can drive endpoints even after the platform changes.

## 0. Golden rules

1. **Everything is scriptable.** Add `--json` to any command to get parseable
   JSON on stdout (human tables and logs go to stderr).
2. **The catalogue is the source of truth.** The platform changes often. Run
   `uno sync` (or trust auto-sync) and then `uno endpoints [filter] --json` /
   `uno describe <id> --json` to know the *current* API. Do not assume an
   endpoint exists — look it up.
3. **Never handle the user's password.** Login reads it from a local file the
   user fills in; you only ever run `uno login`.
4. **Prefer curated commands** (below) for the common student tasks; fall back
   to `uno call <id>` / `uno api <METHOD> <path>` for anything else.

## 1. First-time setup

Check status first:

```bash
uno status --json
```

If `loggedIn` is false, trigger the credentials flow:

```bash
uno login
```

On first run this creates `~/.unoanalyzer/credentials.json` (mode 0600) and
prints instructions. **Ask the user to open that file and fill in their platform
`email` and `password`**, then run `uno login` again. (Alternatively they can
export `UNO_EMAIL` / `UNO_PASSWORD`.) After a successful login the session is
saved and refreshes automatically — the user only logs in once.

## 2. Keeping the command set current (self-updating)

The CLI auto-detects when the platform is rebuilt and refreshes its local
manifest. To force it:

```bash
uno sync              # re-discover the whole API from the live app bundles
uno status --json     # see endpoint count + platform build hash
```

Browse / search the catalogue — do this to "deeply know" every endpoint:

```bash
uno endpoints --json                 # all endpoints
uno endpoints weekly --json          # filter by text
uno endpoints -c groups --json       # filter by category
uno describe weeklyLog.myEntry --json
```

A committed snapshot also lives at `references/endpoints.md` /
`references/endpoints.json` next to this skill, but always prefer the live
`uno endpoints` output when acting.

## 3. Curated student commands (use these first)

IDs and codes: a course is addressed by **code** (`ENT207TC`) or **id**
(`ent207tc_2026`); the CLI resolves either. "My group" is found automatically
from course membership.

| Task | Command |
|------|---------|
| Who am I | `uno whoami --json` / `uno me --json` |
| List courses | `uno courses --json` |
| Course overview | `uno course show ENT207TC --json` |
| Assessments / milestones / materials | `uno course assessments ENT207TC` · `uno course milestones ENT207TC` · `uno course materials ENT207TC` |
| Join a course | `uno course join <CODE> --yes` |
| Weekly briefing | `uno brief ENT207TC --json` |
| My mentor | `uno mentor ENT207TC --json` |
| My group | `uno group show ENT207TC` · `uno group activity ENT207TC` · `uno group members ENT207TC` · `uno group milestones ENT207TC` |
| Add a group task | `uno group task-add ENT207TC "text"` |
| Weekly logs | `uno log list ENT207TC` · `uno log show ENT207TC <week>` |
| Submit my weekly entry | `uno log submit ENT207TC <week> -t "what I did"` |
| Evidence records | `uno record list` · `uno record show <id>` |
| Create a record | `uno record create -t "User interview" --course ENT207TC --date 2026-09-20` |
| Attach proof | `uno record proof <id> --file ./photo.jpg` (or `--link <url>`) |
| Capabilities | `uno capability list --course ENT207TC --json` · `uno capability evidence <subCapId>` |
| Narrative | `uno narrative show` · `uno narrative generate` · `uno narrative approve` |
| Spaces | `uno space list` · `uno space create "Side project"` |
| Course assistant | `uno chat ask ENT207TC "how do I frame my problem?"` · `uno chat history ENT207TC` |
| Project proposals | `uno proposal requirements ENT207TC` · `uno proposal feedback <id>` · `uno proposal submit <id>` |

## 4. Generic access (any endpoint, present or future)

Invoke any catalogued endpoint by id; positional args fill path params in order
(a `studentUid` param auto-fills with the logged-in user):

```bash
uno call course.detail ent207tc_2026
uno call group.activity <groupId>
uno call records.create -d '{"title":"Demo","date":"2026-09-20"}'
uno call weeklyLog.list ent207tc_2026 <groupId>
uno call <id> <val1> <val2> -q key=value --file ./upload.png
```

Or make a raw authenticated request (path may be full `/api/cn/...` or relative
`courses/x`, which is prefixed with the active region base):

```bash
uno api GET /api/cn/me
uno api POST /api/cn/records -d '{"title":"X","date":"2026-09-20"}'
uno api GET courses/ent207tc_2026/proof-activity
```

Discover the exact path/params/body for anything with `uno describe <id>` or by
reading `references/endpoints.md`.

## 5. How auth works (for debugging)

- Auth is **Supabase**: `POST {backendUrl}/auth/v1/token?grant_type=password`
  with an `apikey` header (public publishable key) → `{access_token,
  refresh_token, expires_in}`.
- API calls send `Authorization: Bearer <access_token>` to
  `{backendUrl}/api/cn/...`.
- The token is a short-lived JWT; the CLI refreshes it with the refresh token,
  and if that fails re-logs-in from the credentials file. Config, session and
  manifest live in `~/.unoanalyzer/`.
- Behind a proxy? The CLI honours `HTTPS_PROXY` / `HTTP_PROXY`.

## 6. Tips

- Endpoints marked `staff only` (403 for students) exist in the catalogue but
  are not usable with a student account — don't retry them.
- Always pass `--json` when you intend to parse output.
- Set `UNO_DEBUG=1` to see the underlying HTTP requests and error payloads.
- Full human-readable API documentation is in `API.md` at the repo root.
