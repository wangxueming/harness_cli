# Spec contract

Every feature uses `templates/spec-five-questions.md` under:

`docs/exec-plans/active/<domain>/<feature>/`

## Five questions

1. What we **solve**
2. What we **explicitly do not** solve
3. Allowed **paths / surfaces**
4. **Contracts** that must not change
5. **Done when** — commands that must pass (e.g. `pnpm harness check`)

## SDD workflow (optional)

Spec-Driven Development — **review gates between document phases**, then implement and verify.

### Phase A — Spec documents (gate after each step)

```text
requirements → [spec-judge: GO] → design → [spec-judge: GO] → tasks → [spec-judge: GO]
```

### Phase B — Implementation (after spec is frozen)

```text
impl → test → code review (reviewer ↔ implementer) → harness check → human merge
```

Subagent order when automating the full chain: `spec-requirements` … `spec-tasks`, then `spec-impl`, `spec-test`, and `spec-judge` as needed **per document** or for final verdict — not “judge only once at the very end of the project” by default.

Full prompts: `.claude/agents/sdd/`. See [HARNESS_ENGINEERING/roles/swimlanes.md](../HARNESS_ENGINEERING/roles/swimlanes.md) §1.1.
