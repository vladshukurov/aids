---
name: build-screen
description: Design and build one mobile banking screen in the re:verse DS Figma file from a text request — including screens no recipe covers ("profile", "subscriptions", "card frozen", "Spirit answer about October"). Plans the composition, writes a JSON spec, lints and renders it with the repo renderer, audits, then iterates with an independent visual critic. Not for multi-screen flows (build-flow) or reviewing an existing screen (audit-screen).
---

# Build a screen

The goal is a screen that looks designed, not assembled. The renderer guarantees the system (instances, tokens, spacing, row rules); you are responsible for the content and the composition. The critic decides when it is good.

## 0. Setup (once per session)
- Read `AGENTS.md`, `foundations/layout.md`, `foundations/anti-patterns.md`, `foundations/persona.md`, `specs/format.md`.
- Figma: `create_session` with `qUknPCIey4DG3PH19e1OmD`, pass `sessionId` everywhere. Load the Figma `figma-use` skill before the first `use_figma`. Several Figma servers → `whoami` on each, use the one with a Full/Dev seat.
- `state/library.json` has `"generated": null` → run `sync-library` first.

## 1. Plan (write it in your reply before the spec)
1. Archetype (layout.md §2), recipe (`recipes/overview.md`) and the spec to start from.
2. The six answers of layout.md §1: object, hero, actions, sections, state, next step.
3. **ASCII sketch** of the zones, e.g.
```
TopBar "CARD •••• 0020"
Hero: Card L (frozen)
Actions: [Unfreeze]
Card: Card is frozen · … | Limits › | Replace card ›
Transactions · View all: Vapiano −$31.50 | Apple −$2.99 | Amazon −$46.20
Bottom chat: "Undo" "I lost my card"
```
4. **Data inventory:** every title, caption and value, each from persona.md (add a missing fact there first). Captions state a fact or a consequence.
5. **Plan review** against anti-patterns.md: anything default, empty, one-row, invented or Spirit-named? Fix the plan now.

## 2. Spec → lint → render
1. Copy the closest spec from `specs/examples/` to `specs/work/<id>.json` and write yours (`specs/format.md`).
2. `node scripts/lint-spec.mjs specs/work/<id>.json` → 0 errors. Treat warnings as questions you must answer.
3. `node scripts/build-call.mjs specs/work/<id>.json --section "Polygon · <task> · <date>"`.
4. Read `.out/call.js` and pass it whole as `code` to one `use_figma` call (`skillNames: "figma-use"`). If it answers `needsInstall`, the file has an older renderer: rebuild with `--patch-from <installed>` and run `.out/patch.js` (or `.out/install.js` when no local copy of the old version exists), then the call again.
5. Read the result: `screens[].frame` ids, inline screenshots, `log`. Every log line is a defect: missing component/property → `sync-library` or a renderer fix; unknown icon → pick from `components/icons.md`. Re-render with `--replace` after fixing.

## 3. Check
1. Paste `scripts/figma/audit-screen.js` with `FRAME_IDS = ['<id>']` into `use_figma` → fix every error (in the spec when possible).
2. Look at the inline screenshot against anti-patterns.md and layout.md §7: truncation, overlaps, mixed icons, empty bands, a weak hero. Fix obvious slips first.

## 4. Critic rounds
1. Spawn an **independent** critic with `agents/screen-critic.md` (Claude Code: subagent `screen-critic`; Codex: `codex exec` with that file as the prompt plus the inputs; otherwise ask the person to run it in a fresh session). Inputs: frame id, archetype, the reference from `evals/references.md`. Never grade your own visual quality.
2. Apply its fixes **in the spec**, re-render with `--replace` into a copy section `Polygon · <task> · round N`, re-run the critic with the previous scores. Keep a round only if its average went up. Max 3 rounds; ship when every score ≥ 8.
3. Verify each finding on the screenshot before acting — critics can be wrong; product rules beat critics.

## 5. Report
Plan, spec path, frame ids, audit result, critic scores per round, what the renderer could not do (component blocks, custom code), facts you added to persona.md. If the screen type had no recipe and shipped, add the recipe and move the spec to `specs/examples/`.

## Never
- Hand-code a screen the renderer can build; extend the renderer instead (its own change, with `check-docs`).
- Add a success screen. Name "Spirit" outside the chat. Use green for anything but incoming money.
- Leave a one-row section, a spacer pushing a button down, or an invented fact.
