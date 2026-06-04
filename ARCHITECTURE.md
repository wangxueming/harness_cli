# Architecture overview

## Two harnesses

| Term | Meaning |
|------|---------|
| **Repo Harness** | `AGENTS.md`, `policy/`, `docs/`, CI, layer tests |
| **Runtime Harness** | `orchestrator/`, `harness` CLI, DAG (P2+) |

## Five layers (source of truth)

```text
L0 souls/          → personality
L1 policy/         → discipline
L2 config/         → registry YAML
L3 .cursor/ etc.   → compiled adapters
L4 orchestrator/   → runtime (P2+)
```

## Terminology

See ENGINEER_DOC.md appendix B (Soul, Mission, Policy, Registry, Domain).

## Demo domain

Reference implementation: `packages/demo-domain` enforces layers in `policy/layers.yaml` and `tests/architecture-boundary.test.ts`.
