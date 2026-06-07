# Harness

Agent-First engineering template for large technical projects. **Cursor-first**, with compile paths for Claude/Codex (P2).

## Quick start

```sh
pnpm install
pnpm agents:compile
pnpm harness check
```

Open in Cursor and read [`AGENTS.md`](AGENTS.md). For a full walkthrough (24-point game example), see [`USAGE.md`](USAGE.md).

## Documentation

- **[ENGINEER_DOC.md](ENGINEER_DOC.md)** — full v2 blueprint
- **[docs/guides/getting-started.md](docs/guides/getting-started.md)** — onboarding

## Layout

| Path | Role |
|------|------|
| `souls/` | Per-role personality (source of truth) |
| `policy/` | Tool-agnostic discipline |
| `config/` | Registry (agents, domains, models, tools) |
| `.cursor/agents/` | Generated Cursor subagents |
| `packages/` | Business domains |
| `tools/harness-cli` | `compile`, `validate-souls`, `check` |

## P1 status

- [x] Policy + docs skeleton
- [x] 13 roles with SOUL
- [x] `harness compile` → `.cursor/agents`
- [x] `demo-domain` + architecture boundary test
- [x] Basic CI workflow (`.github/workflows/ci.yml`)
- [ ] Claude/Codex compile (P2)
- [ ] SDK DAG (P2)
