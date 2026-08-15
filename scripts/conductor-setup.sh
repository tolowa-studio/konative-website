#!/usr/bin/env bash
set -euo pipefail

echo "MotionOS Conductor setup: konative-website"
mkdir -p .context

if [ ! -f .context/MOTION_CONDUCTOR_START.md ]; then
  cat > .context/MOTION_CONDUCTOR_START.md <<'EOF'
# MotionOS Conductor Workspace

Read these first:

1. `AGENTS.md`
2. `CLAUDE.md` if present
3. `docs/conductor-control-plane.md`
4. Any task-specific files or notes attached in Conductor

Before stack, auth, architecture, MCP, CLI, or credential advice, recall Stash
with a 2-6 word query in `/tools` or this repo's project namespace.

Conductor is the control plane:

- Conductor owns workspace isolation, setup/run scripts, review, merge, and archive.
- Claude Code and Codex own reasoning, implementation, and verification.
- Stash owns durable memory.
- Notion owns visible canonical docs.
EOF
fi

echo "Workspace context ready."
