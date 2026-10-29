---
name: build-flow
description: Design a multi-screen flow in the re:verse DS Figma file from a short brief ("split a dinner bill", "freeze a lost card and order a new one"): brief → discovery → flow on paper → one spec file for all screens → render as a clickable prototype → audit → three critics → fixes → handoff. Use when the request needs 3+ screens or edge cases. For one screen use build-screen.
---

# Build a flow from a brief

## 1. Brief → `scenarios/<flow>.md`
Copy `scenarios/_template.md`. Write the brief in one paragraph in the requester's words: who, what job, why now.

## 2. Discovery (short, written into the md)
- Market: with a Mobbin MCP, look at 3–5 flows of the same job and note what to take (the logic, not the chrome). Otherwise use your knowledge of 3 leading banking apps and say so.
- System: `recipes/overview.md` and `scenarios/` — reuse an existing recipe or flow before inventing one.
- Entry points: where the person starts (home statement, account, card, chat, push).
- Direction unclear → write 2–3 really different variants with a recommendation and continue with it unless told otherwise.

## 3. Flow on paper (in the md, before any spec)
- Screen table: code, screen, recipe, goes to.
- Edge cases: error, empty, cancel, not enough money, person not on re:verse, the other participant's side.
- Numbers: every name, amount, date and balance, taken from persona.md (add missing facts there). Recalculate: balances before/after match across screens; weekdays match dates.
- Product rules: no success screens (land on the object + Undo chip), Face ID only when money leaves re:verse, reversible actions happen at once, irreversible ones ask (Alert), chat follow-ups are messages.

## 4. One spec file → render
- `scenarios/<flow>.json` with `{ "flow": "<name>", "screens": [...] }`, one screen per table row, `caption` = the table's "what happens and why", `links` for every tap the table promises (`cta`, `row:<title>`, `suggest:<label>`, `back`).
- `node scripts/lint-spec.mjs scenarios/<flow>.json` → 0 errors.
- `node scripts/build-call.mjs scenarios/<flow>.json --section "Polygon · <flow> · <date>"` → one `use_figma` call. Over the size limit → split by screens, but keep linked screens together.
- Put the frame ids into the md table.

## 5. Check
- `scripts/figma/audit-screen.js` with all frame ids in one call; fix every error.
- `scripts/figma/audit-flow.js` with the frame ids in flow order: photos per name, dead ends, money per screen. Recompute the numbers from its table against the md.
- Look at every inline screenshot; fix obvious slips before the critics.

## 6. Three critics (in parallel, independent)
- `agents/flow-reviewer.md` — UX, logic, copy, dead ends.
- `agents/screen-critic.md` — visual craft, on the 2 screens that carry the flow (the object screen and the decision screen). Not on every screen.
- `agents/domain-critic.md` — numbers, banking domain, regulation, honest costs.
Give each the md path, the spec path and the frame ids, not your conclusions. Verify each finding on the screenshot and in the data before fixing (critics can be wrong; owner decisions beat critics). Fix in the spec, re-render with `--replace`. Record fixed / rejected with the reason in the md "Review" section. Max 3 rounds.

## 7. Handoff
Report: screens with ids, decisions the owner may want to reverse, critic scores per round, what the renderer couldn't do, open questions. Add a row to `evals/log.md`.
