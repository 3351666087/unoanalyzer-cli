#!/usr/bin/env bash
#
# One-shot installer for the UnoAnalyzer CLI + its agent guide as a Claude Code
# skill. Run from a checkout of this repo:
#
#   bash scripts/install-claude-skill.sh
#
# What it does:
#   1. Builds and `npm link`s the `uno` CLI if it isn't already on PATH.
#   2. Generates ~/.claude/skills/unoanalyzer/SKILL.md from the framework-neutral
#      agent/AGENT.md (adds the small YAML front-matter Claude Code expects) and
#      copies the endpoint reference.
#
# The underlying guide (agent/AGENT.md) is vendor-neutral; this script is just
# the Claude Code adapter. For other agents, load agent/AGENT.md directly.
#
# Override the skills location with CLAUDE_SKILLS_DIR (default ~/.claude/skills).
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_ROOT="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
SKILL_DIR="$SKILLS_ROOT/unoanalyzer"

echo "→ Repo:  $REPO_ROOT"
echo "→ Skill: $SKILL_DIR"

# 1. Ensure the `uno` binary exists.
if command -v uno >/dev/null 2>&1; then
  echo "✓ uno already installed at $(command -v uno) ($(uno --version 2>/dev/null || echo '?'))"
else
  echo "→ Building and linking the uno CLI…"
  ( cd "$REPO_ROOT" && npm install && npm run build && npm link ) || {
    echo "✗ 'npm link' failed. Try: (cd \"$REPO_ROOT\" && npm install -g .)" >&2
    exit 1
  }
  echo "✓ uno installed at $(command -v uno)"
fi

# 2. Install the skill.
mkdir -p "$SKILL_DIR"
{
  printf -- '---\n'
  printf -- 'name: unoanalyzer\n'
  printf -- 'description: Operate the UnoAnalyzer platform (ENT207TC Digital Startup Lab) via the uno CLI: courses, groups, weekly logs, evidence records, capabilities, proposals, mentor briefings and the course assistant.\n'
  printf -- '---\n\n'
  cat "$REPO_ROOT/agent/AGENT.md"
} > "$SKILL_DIR/SKILL.md"
rm -rf "$SKILL_DIR/references"
cp -r "$REPO_ROOT/agent/references" "$SKILL_DIR/references"

echo "✓ Installed skill: $SKILL_DIR/SKILL.md"
echo
echo "Next steps:"
echo "  1. uno login            # creates ~/.unoanalyzer/credentials.json"
echo "  2. edit that file with your platform email + password, then: uno login"
echo "  3. In Claude Code, ask e.g. \"what's due this week in ENT207TC?\""
