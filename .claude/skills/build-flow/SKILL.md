---
name: build-flow
description: Design a multi-screen flow in the re:verse DS Figma file from a short brief ("split a dinner bill", "freeze a lost card and order a new one"): brief → discovery → flow on paper → build screens → audit → strict review → fixes → handoff. Use when the request needs 3+ screens or edge cases. For one screen use build-screen.
---

# Build a flow from a brief

## 1. Brief → `scenarios/<flow>.md`
Copy `scenarios/_template.md`. Write the brief in one paragraph: who, what job, why now.

## 2. Discovery (short, written into the md)
- Market: if a Mobbin MCP is available, look at 3–5 flows of the same job and note what to take. Otherwise use your knowledge of 3 leading banking apps and say so.
- System: read `recipes/overview.md` and `scenarios/` — reuse an existing recipe or flow before inventing one.
- Decide the entry points: where the person starts (home statement, account, card, chat).

## 3. Flow on paper (in the md, before any drawing)
- Screen table: #, screen, recipe, goes to.
- Edge cases: error, empty, cancel, not enough money, person not on re:verse.
- Numbers: every name, amount, date and balance used anywhere. Recalculate: balances before/after must match across screens.
- Apply the product rules: no success screens (land on the object + Undo chip), Face ID only when money leaves re:verse, chat follow-ups are messages.

## 4. Build on page Polygon
- One section per flow, named after it. Screens left to right in flow order, 120 gap; branches go under their source screen.
- Each screen with the `build-screen` method (instances only, tokens, recipes). Batch several screens per `use_figma` call.
- Put each screen's frame id into the md table.

## 5. Check
- Run `scripts/audit-screen.js` on every screen; fix errors.
- Screenshot every screen; check numbers and copy against the md.

## 6. Strict review
Run the `flow-reviewer` agent with the md path and section id. Re-check each finding yourself on a screenshot before fixing (reviewers can be wrong). Record what you fixed and what you rejected in the md "Review" section.

## 7. Handoff
Report: screens with ids, decisions, rubric scores, open questions. Update `state/figma-ledger.json`.
