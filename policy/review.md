# Review and merge gate

Before merge:

1. Spec five questions answered and linked in PR description.
2. `pnpm harness check` green locally (CI in P2).
3. `/reviewer` or equivalent review for security-sensitive paths.
4. No new architecture boundary violations (ratchet: `KNOWN_VIOLATIONS` only shrinks).
5. Generated agents match sources: `pnpm agents:compile` then no diff, or CI `compile --check`.

Severity for findings: **Critical** | **High** | **Medium** | **Info**.
