# Global NEVER

1. **DO NOT** import upward across layers (`ui` → `service` is forbidden). See `docs/architecture/LAYERS.md`.
2. **DO NOT** edit files marked `<!-- generated: do not edit -->` under `.cursor/agents/`. Change `souls/` and run `pnpm agents:compile`.
3. **DO NOT** commit secrets (`.env`, API keys). Use `.env.example` only.
4. **DO NOT** expand Spec scope without updating `docs/exec-plans/` and re-approval.
5. **DO NOT** mark work complete without running `pnpm harness check` (or CI equivalent).
6. **DO NOT** bypass review for auth, payments, or public API changes.
