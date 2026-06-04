# Harness Template — Agent Map

> Agent-First monorepo template. **Primary IDE: Cursor.** CLI: `pnpm harness <cmd>`. Blueprint: `ENGINEER_DOC.md`.

## Stack

| Layer | Tech |
|-------|------|
| Monorepo | pnpm workspaces |
| Language | TypeScript |
| Test | Vitest |
| Lint | ESLint 9 |
| Agents | Cursor subagents (compiled from `souls/`) |

## Architecture layers

Within each package (start with `packages/demo-domain`):

```text
types → config → repo → service → runtime → ui
```

Cross-cutting: `providers/` only. **Never import upward.**

→ `docs/architecture/LAYERS.md` · `policy/layers.yaml`

## Commands

```sh
pnpm install
pnpm agents:compile      # souls → .cursor/agents/
pnpm harness check       # validate souls + tests + compile drift
pnpm test
pnpm test:boundary
pnpm lint
pnpm dev               # demo-domain
```

## Souls and subagents

| Item | Path |
|------|------|
| Personality (source) | `souls/<role>/SOUL.md` |
| Registry | `config/agents.registry.yaml` |
| Generated agents | `.cursor/agents/*.md` — **do not hand-edit** |

Invoke: `/reviewer`, `/implementer`, `/orchestrator`, `/spec-requirements`, etc.

SDD detailed prompts: `.claude/agents/sdd/` (P2 unify via compile).

## Context tiers

| Tier | Load |
|------|------|
| T1 | This file + `policy/never-do.md` |
| T2 | `policy/domains/*` + role SOUL when delegated |
| T3 | `docs/exec-plans/`, `docs/architecture/` |

## Where to look

| Task | Start here |
|------|------------|
| Full design | `ENGINEER_DOC.md` |
| Onboarding | `docs/guides/getting-started.md` |
| New feature Spec | `docs/exec-plans/active/<domain>/<feature>/` |
| Layer violation | `docs/architecture/LAYERS.md` |
| Soul authoring | `docs/guides/per-role-soul.md` |
| Rule → Spec → Harness | `docs/guides/adoption-path.md` |
| Models (P2+) | `config/models.registry.yaml` |

## Domains

| Domain | Package |
|--------|---------|
| demo-domain | `packages/demo-domain` |

Add domains in `config/domains.yaml`.

## Policy

- `policy/never-do.md` — global NEVER
- `policy/spec-contract.md` — Spec five questions
- `policy/review.md` — merge gate

## Docs map

```text
docs/
├── index.md
├── architecture/LAYERS.md
├── guides/
├── golden-principles/
└── exec-plans/
```
