# UI design contract

Agent-readable visual design system for Harness monorepos. Artifact name: **`ui-design.md`** (not `DESIGN.md`, not SDD `design.md`).

## Artifact map

| File | Primary reader | Defines |
|------|----------------|---------|
| `README.md` | Humans | What the project is |
| `AGENTS.md` | Coding agents | How to navigate and build |
| **`ui-design.md`** | UI / coding agents | How the project should **look and feel** |
| `docs/exec-plans/.../design.md` | Coding agents | How to **architect and implement** (SDD) |

`ui-design.md` is the visual counterpart to `AGENTS.md`. SDD `design.md` covers layers, interfaces, and flows — never color tokens or component chrome.

## What it gives you

When `/ui-designer`, `spec-impl`, or `implementer` reads `ui-design.md`, every screen in `ui/` should follow the same palette, typography, spacing, and component patterns. Without it, screens drift; with it, they read as one product.

`ui-design.md` is a **living artifact**: agents draft it, humans refine it, implementers re-apply it on each UI iteration.

## File placement

| Scope | Path | Precedence |
|-------|------|------------|
| Repo default | `ui-design.md` (repository root) | Baseline for all packages |
| Domain override | `packages/<domain>/ui-design.md` | Overrides root for that package only |

**Merge rule**: implementers read **package `ui-design.md` first**; where a token or section is absent, fall back to root `ui-design.md`. Package file must not contradict root without stating the override in prose.

**Starter scaffold**: `templates/ui-design.md` — copy structure, replace placeholders; do not commit the template as a project design system.

## Format: two layers

Every `ui-design.md` has:

1. **YAML front matter** — machine-readable design tokens (exact values)
2. **Markdown body** — human-readable rationale and usage rules

Tokens give agents precise values. Prose explains *why* and *when*. YAML and prose must agree; prose must not contradict front matter.

### YAML front matter

Delimiter: opening `---` on line 1, closing `---` before the first markdown heading.

#### Required keys

| Key | Type | Notes |
|-----|------|-------|
| `name` | string | Design system display name (e.g. `Game24 Warm`) |

#### Recommended token groups

Extend or omit only when the product truly has no use for a group; document the omission in prose.

**`colors`** — semantic palette (hex strings `#rrggbb`):

| Token | Typical use |
|-------|-------------|
| `primary` | CTAs, active states, key interactive elements |
| `secondary` | Supporting UI, chips, secondary actions |
| `surface` | Page / screen backgrounds |
| `on-surface` | Primary text on `surface` |
| `error` | Validation errors, destructive actions |

Optional extensions: `surface-variant`, `outline`, `success`, `warning`, `on-primary`, brand-specific names. Unknown color keys are **accepted**.

**`typography`** — map of scale names to objects:

```yaml
typography:
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
```

Recommended scale names: `display`, `headline`, `title`, `body-md`, `body-sm`, `label`. Platform stacks allowed (e.g. `PingFang SC`, `system-ui`).

**`spacing`** — named steps (px or rem):

```yaml
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
```

**`rounded`** — corner radii:

```yaml
rounded:
  sm: 4px
  md: 8px
  lg: 16px
  full: 9999px
```

**Custom top-level keys** (motion, elevation, breakpoints, `mini-program`, etc.) are **accepted**. Document them in the markdown body.

### Markdown body

Use standard markdown headings. No special syntax beyond markdown + YAML.

#### Required sections

| Section | Purpose |
|---------|---------|
| `## Overview` | Vibe, density, audience, one-screen summary |
| `## Colors` | Each semantic color: hex, when to use, when **not** to use |
| `## Typography` | Scale usage: headlines, body, labels, casing rules |
| `## Components` | Buttons, inputs, cards, lists, modals — states included (default, hover/pressed, disabled, error) |
| `## Do's and Don'ts` | Bullet list of enforceable visual rules |

#### Recommended sections

| Section | When to include |
|---------|-----------------|
| `## Spacing & Layout` | Grid unit, page padding, safe areas (status bar, tab bar, notch) |
| `## Motion` | Duration, easing, reduced-motion fallback |
| `## Platform notes` | WeChat mini-program, mobile web, desktop-specific overrides |

Unknown `##` sections are **accepted** — the spec is a foundation, not a closed schema.

## Philosophy

- **Foundation, not prescription** — shared vocabulary for colors, type, layout, components; freedom to extend.
- **Unknown sections and custom tokens are accepted**, not rejected.
- **No implementation detail** — no TypeScript, no import paths, no service diagrams (those belong in SDD `design.md`).
- **Contrast** — state target ratios in Do's and Don'ts (e.g. 4.5:1 body text, 3:1 large text) when relevant.

## Creation paths

`/ui-designer` may use any path; record the source in `## Overview` when non-obvious.

| Path | Input | Output |
|------|-------|--------|
| **From vibe** | Short aesthetic brief (e.g. "playful, warm, rounded") | Full token set + prose |
| **From brand** | Brand URL, PDF, or reference image | Extracted palette, type, patterns |
| **By hand** | Human-authored preferences | Direct edit of `ui-design.md` |

Human sign-off required when a reference design or brand guide already exists — do not invent conflicting tokens.

## Roles

| Role | Responsibility |
|------|----------------|
| `/ui-designer` | Author and revise `ui-design.md` |
| `spec-impl` / `implementer` | Read applicable `ui-design.md` before editing `ui/` |
| `reviewer` | May flag UI drift against declared tokens |
| `spec-design` | Technical `design.md` only — does **not** own `ui-design.md` |

## Workflow

```text
[optional] /ui-designer → ui-design.md
         ↓
requirements → design.md → tasks.md → spec-impl (ui/ tasks apply ui-design.md)
```

`ui-design.md` may be written **before, during, or after** SDD documents, but must exist **before** `ui/` implementation tasks start unless the human explicitly waives visual consistency.

## Validation checklist

Before marking `ui-design.md` ready for implementation:

- [ ] YAML parses; `name` is set
- [ ] At least `colors.primary`, `colors.surface`, `colors.on-surface` defined
- [ ] Every YAML color token appears in `## Colors` with usage guidance
- [ ] `## Components` covers every interactive pattern the feature needs
- [ ] `## Do's and Don'ts` has at least three enforceable rules
- [ ] No SDD content (APIs, layer diagrams, data models)
- [ ] Package override (if any) documents what it overrides vs root

## Minimal example

```markdown
---
name: DevFocus Dark
colors:
  primary: "#2665fd"
  secondary: "#475569"
  surface: "#0b1326"
  on-surface: "#dae2fd"
  error: "#ffb4ab"
typography:
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
rounded:
  md: 8px
spacing:
  sm: 8px
  md: 16px
---

# Design System

## Overview
A focused, minimal dark interface for a developer productivity tool.
Clean lines, low visual noise, high information density.

## Colors
- **Primary** (#2665fd): CTAs, active states, key interactive elements
- **Secondary** (#475569): Supporting UI, chips, secondary actions
- **Surface** (#0b1326): Page backgrounds
- **On-surface** (#dae2fd): Primary text on dark backgrounds
- **Error** (#ffb4ab): Validation errors, destructive actions

## Typography
- **Headlines**: Inter, semi-bold
- **Body**: Inter, regular, 14–16px
- **Labels**: Inter, medium, 12px, uppercase for section headers

## Components
- **Buttons**: Rounded (8px), primary uses brand blue fill
- **Inputs**: 1px border, subtle surface-variant background
- **Cards**: No elevation; border and background contrast only

## Do's and Don'ts
- Do use primary sparingly — only the most important action per view
- Don't mix rounded and sharp corners on the same screen
- Do maintain at least 4.5:1 contrast for body text
```

Full blank scaffold: `templates/ui-design.md`.
