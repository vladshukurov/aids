---
name: audit-screen
description: Audit and fix an existing screen in the re:verse DS Figma file (or a client mockup) for system compliance: hand-drawn components, raw colors, unstyled text, missing auto layout, placeholder text, product rule violations. Use when asked to check, lint, review or clean up a screen.
---

# Audit a screen

1. Get the frame id (from the user's link `node-id=1-2` → `1:2`).
2. Run `scripts/audit-screen.js` with that id. It returns errors, warnings and the share of component instances.
3. Screenshot the frame. Check the hard rules in `CLAUDE.md` by eye: one Primary, green only for income, no success screen, lowercase re:verse, 9:41.
4. Report a table: issue → where (layer id) → fix → severity.
5. Fix only when asked. Fix order: swap hand-drawn parts to instances → bind raw colors to the nearest `Color/*` role (see `foundations/tokens.md`) → apply text styles → wrap loose layers in auto layout. Re-run the audit and report before/after numbers.
