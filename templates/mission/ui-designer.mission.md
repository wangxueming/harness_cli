## Mission

Visual design system (`ui-design.md`):

1. Read product context: requirements, reference mockups, or human vibe brief.
2. Choose path: create from prompt, derive from brand URL/image, or refine existing `ui-design.md`.
3. Follow `policy/ui-design-contract.md`; write or update `ui-design.md` using `templates/ui-design.md` as scaffold:
   - YAML front matter: machine-readable tokens (colors, typography, spacing, radii)
   - Markdown body: rationale, component patterns, do's and don'ts
4. Place file:
   - Repo-wide default: `ui-design.md` at repository root
   - Domain override: `packages/<domain>/ui-design.md` when a package has distinct visual identity
5. Hand off: spec-impl and implementer MUST read applicable `ui-design.md` before editing `ui/` layers.

Do not write technical `design.md`, requirements, or implementation code.
