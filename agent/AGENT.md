# UnoAnalyzer CLI — agent operating guide

A framework-neutral guide that lets **any** AI agent (or automation) drive the
`uno` command-line tool to operate the UnoAnalyzer learning-intelligence
platform (`cn.unoanalyzer.com`) for the **ENT207TC — Digital Startup Lab**
course. It is plain Markdown with no vendor-specific format: load it as system
context, a tool/skill description, or retrieval material for whatever agent you
use (see "Wiring into an agent" at the end).

The only capability this guide assumes is that the agent can **run shell
commands** (the `uno` binary) and read their stdout.

## Contract for the agent

- **`uno` is the single tool.** Every action is a shell command starting with
  `uno …`. Nothing else is required.
- **Ask for structured output.** Append `--json` to any command to get JSON on
  stdout (human tables and progress go to stderr).
- **The endpoint catalogue is the source of truth.** The platform changes
  often. Run `uno sync`, then `uno endpoints [filter] --json` /
  `uno describe <id> --json` to know the *current* API before acting. Do not
  assume an endpoint exists — look it up.
- **Never handle the user's password.** Login reads it from a local file the
  user fills in; the agent only ever runs `uno login`.
- **Prefer the curated commands** below for common tasks; fall back to
  `uno call <id>` / `uno api <METHOD> <path>` for anything else.

## 1. Make sure the user is authenticated

```bash
uno status --json
```

If `loggedIn` is false, run:

```bash
uno login
```

On first run this creates a credentials file (`~/.unoanalyzer/credentials.json`,
mode 0600) and prints instructions. **Tell the user to open that file and fill
in their platform `email` and `password`, then run `uno login` again.**
(Alternatively they can set the `UNO_EMAIL` / `UNO_PASSWORD` environment
variables.) After a successful login the session is saved and refreshes
automatically — the user logs in only once.

## 2. Keep the command set current (self-updating)

The CLI auto-detects when the platform is rebuilt and refreshes its local
manifest. To force it and inspect the catalogue:

```bash
uno sync                             # re-discover the whole API from the live app
uno status --json                    # endpoint count + platform build hash
uno endpoints --json                 # every endpoint
uno endpoints weekly --json          # filter by text
uno endpoints -c groups --json       # filter by category
uno describe weeklyLog.myEntry --json
```

A committed snapshot also lives beside this guide at
`references/endpoints.md` / `references/endpoints.json`, but prefer live
`uno endpoints` output when acting.

## 3. Curated student commands (use these first)

A course is addressed by **code** (`ENT207TC`) or **id** (`ent207tc_2026`); the
CLI resolves either. "My group" is detected automatically from membership.

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
  manifest live in `~/.unoanalyzer/` (override the directory with `UNO_HOME`).
- Behind a proxy? The CLI honours `HTTPS_PROXY` / `HTTP_PROXY`.
- Set `UNO_DEBUG=1` to print the underlying HTTP requests and error payloads.

## 6. Tips

- Endpoints marked staff-only return `403` for a student account — don't retry
  them.
- Always pass `--json` when you intend to parse output.
- Full human-readable API documentation is in `../API.md`.

## Wiring into an agent

This guide is deliberately tool-agnostic. Common ways to use it:

- **Any tool-calling LLM (Claude, GPT, Gemini, local models, etc.):** put the
  contents of this file (optionally plus `references/endpoints.md`) into the
  system prompt / context, and expose a shell/bash tool. The agent then issues
  `uno …` commands.
- **LangChain / AutoGen / CrewAI / custom loops:** load this file as the tool
  description for a "run shell command" tool, or as a retrieval document.
- **Coding agents that read `AGENTS.md`** (Codex, Cursor, Windsurf, …): the repo
  root `AGENTS.md` points here.
- **Claude Code / Anthropic Agent Skills:** create
  `~/.claude/skills/unoanalyzer/SKILL.md` containing 3-line YAML front-matter
  (`name`, `description`) followed by this file's body — for example:

  ```markdown
  ---
  name: unoanalyzer
  description: Operate the UnoAnalyzer platform (ENT207TC) via the `uno` CLI.
  ---
  ```

  then append everything under "# UnoAnalyzer CLI — agent operating guide".
