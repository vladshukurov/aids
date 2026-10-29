---
name: sync-library
description: Refresh state/library.json, components/_properties.md and the icon list from the re:verse DS Figma file after components, variables or styles change; then check the md docs against it. Use after any library change, when the renderer logs a missing component or property, or when library.json says "generated": null.
---

# Sync the library

1. `create_session` on `qUknPCIey4DG3PH19e1OmD`.
2. In **one message**, two parallel `use_figma` calls with `scripts/figma/dump-library.js`:
   - `PAGE_ID` = `state/figma.json` → pages.Components, `TOKENS = true`;
   - `PAGE_ID` = pages._internal, `TOKENS = false`.
3. Save each returned JSON exactly as returned to `.out/lib-components.json` and `.out/lib-internal.json`.
4. `node scripts/merge-library.mjs .out/lib-components.json .out/lib-internal.json` → writes `state/library.json`, `components/_properties.md`, the icon list in `components/icons.md`.
5. `node scripts/check-docs.mjs` → every md that names a property or value Figma doesn't have. Fix the md (or, if the md is right, the component — then republish and sync again).
6. Photos (only when `state/figma.json` → `photos` is empty or a person was added): find one avatar layer with each person's photo (the split bill screens or Examples) and record `"Anna Costa": "<layer id>"`. One photo per person, never shared.
7. Report: counts, what changed since the last dump (`git diff --stat state/library.json`), problems fixed. A person republishes the library in Figma if components or descriptions changed.
