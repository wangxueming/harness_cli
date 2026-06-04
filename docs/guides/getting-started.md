# Getting started

```sh
pnpm install
pnpm agents:compile
pnpm harness check
```

Open the repo in **Cursor**. Read `AGENTS.md`, then try `/reviewer` on a small change.

## Edit agent personality

1. Change `souls/<role>/SOUL.md`
2. Run `pnpm agents:compile`
3. Commit soul + generated `.cursor/agents/`

## New feature

1. Copy `templates/spec-five-questions.md` to `docs/exec-plans/active/demo-domain/<feature>/`
2. Run SDD subagents or implementer with Spec scope
