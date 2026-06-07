# game24 policy

- All code under `packages/game24-miniprogram/src/` follows layer rules in `policy/layers.yaml` (`game24` segment).
- Cross-cutting concerns only via `providers/` (e.g. score-store, WeChat storage adapters).
- Specs for this domain: `docs/exec-plans/active/game24/`.
