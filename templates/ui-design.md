<!-- Scaffold only — spec: policy/ui-design-contract.md. Copy to ui-design.md or packages/<domain>/ui-design.md; do not commit this template as the project design system. -->
---
name: Project Name
colors:
  primary: "#000000"
  secondary: "#000000"
  surface: "#000000"
  on-surface: "#000000"
  error: "#000000"
typography:
  display:
    fontFamily: System
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.2
  headline:
    fontFamily: System
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: System
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: System
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: System
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.4
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
rounded:
  sm: 4px
  md: 8px
  lg: 16px
  full: 9999px
---

# Design System

## Overview

One paragraph: product vibe, visual density, primary user context, and creation source (vibe brief / brand / hand-authored).

## Colors

- **Primary** (`#hex`): CTAs, active states, key interactive elements
- **Secondary** (`#hex`): Supporting UI, chips, secondary actions
- **Surface** (`#hex`): Page backgrounds
- **On-surface** (`#hex`): Primary text on surfaces
- **Error** (`#hex`): Validation errors, destructive actions

## Typography

- **Display**: family, weight, size — hero / splash only
- **Headline**: family, weight, size — screen titles
- **Body**: family, weight, 14–16px — default copy
- **Labels**: family, weight, 12px — metadata, section headers, casing rules

## Spacing & Layout

- Base grid unit and page padding (`spacing.*` usage)
- Safe areas or platform-specific insets (status bar, tab bar, home indicator)

## Components

- **Buttons**: shape, fill, min height, disabled and loading states
- **Inputs**: border, background, focus ring, error state
- **Cards**: elevation vs border, corner radius, padding
- **Lists / rows**: separators, tap feedback
- **Modals / sheets**: scrim, corner radius, max width

## Do's and Don'ts

- Do …
- Don't …
- Do maintain stated contrast ratios for text and icons
