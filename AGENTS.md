# konative-website Agent Protocol

This repository is MotionOS Conductor-ready.

## Session start

1. Initialize Stash memory before substantive work.
2. Recall `/projects/konative` for this repo.
3. Recall `/tools` before stack, auth, credential, MCP, CLI, or architecture advice.
4. Read `.context/` for Conductor handoff notes, specs, logs, screenshots, or task files.
5. Use the shared Conductor setup/run scripts for verification.

## Repo

- Local path: `/Users/jerameyjames/repos/konative-website`
- Origin: `https://github.com/tolowa-studio/konative-website.git`
- Stash namespace: `/projects/konative`

## Control-plane model

Conductor creates isolated git worktrees and branches for each task, runs setup
and run scripts, shows status and diffs, and handles review/merge/archive.

Conductor is not the source of truth. Stash is the durable memory index, Notion
is the visible canonical library, and GCP Secret Manager is the credential vault.

## Agent routing

Use Claude Code for architecture, ambiguous reasoning, large refactors, product
judgment, UX/taste review, and final high-risk review.

Use Codex for implementation, tests, lint/typecheck/debug loops, structured
edits, repo-local verification, and second-pass review.

Use both for architecture, security, data model, MCP/tooling, client-visible
workflow, and MotionOS protocol changes.

## Security

Never print or commit secret values. Use placeholders in docs and probe the
configured vault before asking Jeramey for credentials.

## Completion contract

Before marking a Conductor workspace ready for review:

1. Run the relevant tests or explain why they could not run.
2. Summarize changed files and behavioral impact.
3. Identify any required Notion/library update.
4. Remember durable decisions in Stash when the tool is available.
5. Leave no untracked generated junk unless it is intentionally part of the change.
