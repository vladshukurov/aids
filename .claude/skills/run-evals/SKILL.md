---
name: run-evals
description: Regression run of the re:verse DS — render every golden spec (specs/examples, scenarios/*.json) into a fresh Polygon section, audit all of them, have the critic score a sample, and compare with the last run in evals/runs/. Use before merging a change to rules, recipes, the renderer or components, and after a library republish.
---

# Run evals

1. `node scripts/check-docs.mjs` → must be clean before rendering.
2. Render in as few calls as the size limit allows (`build-call` reports the size), all into one section `Polygon · evals · <date>`:
   `node scripts/build-call.mjs specs/examples/<a>.json specs/examples/<b>.json --section "Polygon · evals · <date>" --no-shots`.
   Collect every frame id and every `log` line. A log line is a failure.
3. One `use_figma` with `scripts/figma/audit-screen.js` and all frame ids → errors per screen. Flows → `audit-flow.js`.
4. Screenshots of all frames (one `get_screenshot` each, in parallel). Critic (`agents/screen-critic.md`) on 3 screens: profile, the chat money check and the screen the change touched most. Give it the previous run's scores for the same screens.
5. Write `evals/runs/<date>.md`: change under test, table screen → frame id → log lines → audit errors → critic average; diff against the previous run file. A screen that got worse blocks the change until explained.
6. Keep the section for review; delete eval sections older than the previous run.
