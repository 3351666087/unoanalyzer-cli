# AGENTS.md

This repository ships a self-updating CLI, `uno`, for the UnoAnalyzer platform
(ENT207TC). If you are an AI agent asked to **operate the platform** (read or
manage courses, groups, weekly logs, records, capabilities, proposals, mentor
briefings, the course assistant, or any platform API), follow the operating
guide:

➡️ **[`agent/AGENT.md`](agent/AGENT.md)** — how to drive the `uno` CLI
(framework-neutral; works with any tool-calling agent).

Quick contract: `uno` is the only tool you need; add `--json` for parseable
output; run `uno sync` then `uno endpoints`/`uno describe` to learn the current
API; never handle the user's password (just run `uno login`). Full endpoint
catalogue: [`agent/references/endpoints.md`](agent/references/endpoints.md).
Human API docs: [`API.md`](API.md).

If you are instead asked to **work on this codebase**: it's TypeScript (ESM),
build with `npm run build`, source in `src/` (core in `src/core/`, commands in
`src/commands/`), curated endpoints in `src/curated.ts`, discovery engine in
`src/core/discover.ts`.
