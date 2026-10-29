---
name: audit-screen
description: Audit and fix an existing screen or flow in the re:verse DS Figma file (or a client mockup) for system compliance: hand-drawn components, raw colors, unstyled text, off-scale spacing, chevrons on amount rows, green outflows, wrong card numbers, placeholder text, product rule violations. Use when asked to check, lint, review or clean up a screen.
---

# Audit a screen

1. Frame ids from the link (`node-id=1-2` → `1:2`). Several screens → one call with all ids.
2. Paste `scripts/figma/audit-screen.js` into `use_figma` with `FRAME_IDS` set. It returns, per frame, errors, warnings and the share of instances. A flow → also `scripts/figma/audit-flow.js` (photos per name, dead ends, money per screen).
3. Screenshot each frame. Check by eye what code can't: hierarchy and hero (layout.md §7), anti-patterns.md, copy against voice.md, data against persona.md.
4. Report a table: issue → where (layer id) → fix → severity (error / warning / judgement).
5. Fix only when asked. Order: swap hand-drawn parts to instances → bind raw colors to the nearest `Color/*` role (`foundations/tokens.md`) → apply text styles → wrap loose layers in auto layout → spacing to the scale (`foundations/layout.md` §3). If the screen was built from a spec, fix the spec and re-render with `--replace` instead of patching the frame. Re-run the audit and report before/after numbers.
