# Conductor Control Plane

This repo is prepared for Conductor as the MotionOS control plane.

## Daily flow

1. Open the repo in Conductor.
2. Create a new workspace for one scoped task.
3. Pick Claude Code for planning/review or Codex for implementation/verification.
4. Attach task context or put it in `.context/`.
5. Let the setup script run.
6. Use the Run button to execute the repo verification command.
7. Review the diff.
8. Use a second agent for high-risk review.
9. Merge or archive.

## Shared commands

- Setup: `./scripts/conductor-setup.sh`
- Run: `./scripts/conductor-run.sh`
- Detected verification: `git status --short`

## Agent routing

- Claude Code: architecture, ambiguity, strategy, refactors, critique, high-risk review.
- Codex: implementation, tests, debugging, structured edits, verification.
- Both: security, architecture, MCP/tooling, data model, client-facing workflow.
