# Architecture layers

Dependency flows **downward only** within `packages/demo-domain/src/`:

```text
types → config → repo → service → runtime → ui
```

Cross-cutting concerns use **`providers/`** only (`types`, `config` imports allowed).

## Hard rules

| From | May import |
|------|------------|
| types | (none) |
| config | types |
| repo | types, config |
| service | types, config, repo |
| runtime | types, config, repo, service |
| ui | types, config, repo, service, runtime |
| providers | types, config |

## Remediation

1. Move shared types to `types/`.
2. Push logic down one layer—never import `ui` from `service`.
3. Run `pnpm test:boundary` and fix until green.

Machine source: `policy/layers.yaml`.
