---
name: report-friction
description: Turn a mistake the agent made (or a correction a designer gave) into a fix in the re:verse DS system — a rule, an anti-pattern, a recipe, persona data, a linter or audit check, a renderer change or a component change — plus an eval case that proves it. Use when someone says "the agent keeps doing X", "this is wrong because…", or after a critic finds the same problem twice.
---

# Report friction

The rule of this repo: an agent mistake is fixed in the system, never only in a prompt or in personal memory. Everyone on the team gets the fix.

1. **Capture.** What happened (screen/frame id or spec), what was expected, who said so and why. Quote the designer's words.
2. **Find the cause** — the first that applies:
   - a rule is missing, vague or contradicts another file → the md (one place only; numbers go to `foundations/layout.md`);
   - a fact was invented → add it to `foundations/persona.md`;
   - a known "looks assembled" sign → `foundations/anti-patterns.md` (sign → fix);
   - the rule is mechanical → a check in `scripts/lib/spec.mjs` (lint) or `scripts/figma/audit-screen.js`;
   - the renderer placed it wrong → `scripts/figma/render.js`;
   - the component can't express it (no property, no state) → a component change in Figma (ask the library owner; then `sync-library`);
   - no recipe for this screen type → a recipe + a spec in `specs/examples/`.
3. **Fix it** in the smallest place that prevents it for everyone. Don't duplicate the rule in several files; link.
4. **Prove it.** Add or update a prompt in `evals/prompts.md` (or a spec in `specs/examples/`) that would have caught it; run `node scripts/check-docs.mjs`.
5. **Log** a row in `evals/log.md`: date, what broke, the fix, the file. Open a PR (or a commit on a branch) titled `friction: <one line>`.
