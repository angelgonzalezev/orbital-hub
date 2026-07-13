---
name: create-commit
description: Use when the user asks to create git commits tied to task IDs, split changes into one commit per task, or use the commit format agonzalez/TASK-ID/commit-title. Guides Codex to inspect changes, group files by task, stage explicitly, and commit with the required task identifier.
metadata:
  short-description: Create one git commit per task
---

# Create Commit

Use this skill when creating commits for this project.

## Required Format

Each commit subject must be exactly:

```txt
agonzalez/TASK-ID/commit-title
```

Examples:

```txt
agonzalez/TASK-002/align-landing-copy
agonzalez/TASK-029/add-tech-stack-filter
agonzalez/TASK-036/add-service-validation-tests
```

Rules:

- `TASK-ID` must match a task from `docs/delivery/TASK_BACKLOG.md`.
- `commit-title` must be a short lowercase kebab-case slug.
- Keep `commit-title` specific and action-oriented.
- One commit should represent one task.
- If work spans multiple tasks, create multiple commits.
- If a branch name is needed, use the same `agonzalez/TASK-ID/commit-title` format.

## Workflow

1. Inspect current changes:
   - `git status --short`
   - `git diff --stat`
   - `git diff -- <paths>` as needed.
2. Read only the relevant task from `docs/delivery/TASK_BACKLOG.md`.
3. Determine which changed files belong to that task.
4. If files from multiple tasks are mixed, split commits by task.
5. Stage files explicitly; never use blind `git add .`.
6. Run the smallest relevant verification command before committing when practical.
7. Commit with the required subject format.
8. Report commit hash, task ID, files included, and verification result.

## Safety Rules

- Never commit unrelated user changes.
- Never revert user changes to make a clean commit.
- If file ownership is ambiguous, ask which task the file belongs to.
- If no task ID is given and it cannot be inferred from `TASK_BACKLOG.md`, ask for the task ID.
- If verification fails, do not commit unless the user explicitly asks to commit anyway.
- Stage explicit paths only.

## Task Status Updates

Use these markers in `docs/delivery/TASK_BACKLOG.md`:

- `[x]`: complete.
- `[~]`: partial.
- `[ ]`: pending.

Only mark a task `[x]` when its acceptance criteria are genuinely satisfied.

If a commit only fixes part of a task, keep or set the task to `[~]` and add a short note if useful.

If task status is updated, include that documentation update in the same task commit only when it belongs to that task.

## Commit Body

Use a body only when it adds useful context. Preferred format:

```txt
agonzalez/TASK-029/add-tech-stack-filter

- Adds tech stack filter controls to StartupFilters
- Wires selected tech stack values into marketplace filtering
- Keeps existing category/stage/funding filters unchanged

Verification:
- npm run build: passes
```
