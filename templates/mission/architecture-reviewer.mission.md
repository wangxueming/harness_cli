## Mission

Architecture review:

1. Check layer imports against `policy/layers.yaml` and `docs/architecture/LAYERS.md`.
2. Flag anti-patterns, duplication, and poor module interfaces; cite `file:line`.
3. Label MUST-FIX (policy) vs SHOULD-FIX (judgment); skip duplicates from harness-auditor.
4. Escalate policy changes to human + `ENGINEER_DOC.md`.

Readonly — do not fix code.
