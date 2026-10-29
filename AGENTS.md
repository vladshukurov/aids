# re:verse DS — agent rules

You design mobile banking screens and flows in Figma from the re:verse design system. These rules are for every agent (Claude Code, Codex, any other). Read this file first, then `llms.txt`, then only the files your task needs.

## Source of truth
- **Figma file:** `qUknPCIey4DG3PH19e1OmD` («AI-ready DS»). Pages, sections, examples: `state/figma.json`. Components with ids, keys and properties: `state/library.json` (generated — never edit by hand) and `components/_properties.md`.
- **Tokens:** variables in that file. Never a raw hex, size or font when a variable exists.
- **Components:** the file's components. Never draw a component by hand when one exists.
- **Rules:** this repo. Figma descriptions are short; the md files are the full contract. Spacing numbers live only in `foundations/layout.md`.
- **Data:** `foundations/persona.md`. One person, one day; every name, number and date comes from there. A missing fact is added there first.

## How a screen is made
Screens are described, not hand-coded. The renderer places the blocks with the measured spacing and the row rules; you decide the content.
1. **Recipe.** `recipes/overview.md` → the closest recipe and its spec in `specs/examples/`. No recipe → the nearest one; say so.
2. **Plan.** The six answers of `foundations/layout.md` §1, an ASCII sketch, and the data inventory from persona.md. Check the plan against `foundations/anti-patterns.md`.
3. **Spec.** Write the screen as JSON (`specs/format.md`). Flows: one file, all screens, with `links`.
4. **Lint.** `node scripts/lint-spec.mjs <spec>` → zero errors; read every warning.
5. **Render.** `node scripts/build-call.mjs <spec> --section "<name>"` → pass the whole `.out/call.js` (a few thousand characters: your specs + a loader) as `code` to one `use_figma` call. The renderer itself is installed in the file (shared plugin data, versioned by hash). If the call answers `needsInstall`, run `.out/install.js` once (or `--patch-from <installed hash>` → `.out/patch.js`, much smaller), then the call again. The result returns frame ids, inline screenshots and a `log`: every log line is a bug in the spec or the renderer — fix it, don't ignore it.
6. **Audit.** `scripts/figma/audit-screen.js` (set `FRAME_IDS`) → zero errors. Flows also `scripts/figma/audit-flow.js`.
7. **Critic.** An independent critic scores the screenshot (`agents/screen-critic.md`; flows `agents/flow-reviewer.md`). Never grade your own visual quality. Iterate on the spec, re-render with `--replace`, max 3 rounds, ship when every score ≥ 8.
8. **Report.** Recipe, spec path, frame ids, audit result, critic scores per round, what you guessed or could not do.

Skills wrap these steps: `build-screen`, `build-flow`, `audit-screen`, `sync-library`, `ds-doctor`, `report-friction`, `run-evals` (in `.agents/skills/`, mirrored to `.claude/skills/`).

When the renderer cannot express something (a part with no block yet): use a `component` block, or write plugin code for that part only, following `docs/figma-api.md`; say so in the report and propose the block.

## Hard rules
IMPORTANT: these break the brand when ignored. The linter and the audit check most of them.
- Brand is always lowercase: "re:verse", also inside uppercase titles.
- One dark Primary button per light screen. On dark screens use the on-dark button style.
- Green is only for money coming in. Money going out and "you owe" stay neutral.
- No success screens. After an action the user lands on the object; undo is a chip in the bottom bar.
- Status bar time is 9:41. Take `StatusBar` from the kit.
- Spirit (the AI assistant) lives only in chat. Never write "Spirit" or show its logo in the base UI.
- Radio buttons and checkboxes in sheets sit on the right.
- Rows with an amount on the right have no chevron.
- Card number format: "•••• 0020". On S/XS card sizes: "0020" only.
- One photo per person name across a whole flow.
- UI copy is English, short. Two-tone sentences only in chat and the home feed.
- Never draw your own shader or glow. Use the Spirit components.

## Never
- Detach an instance to change text or icons. Use component properties.
- Add children inside an instance. Wrap it in a frame instead.
- Conclude "no variables" from an empty local list. Search first.
- Invent a component property: the real ones are in `components/_properties.md`.
- Edit `state/library.json` or `components/_properties.md` by hand: run the `sync-library` skill.
- Fix an agent mistake in your prompt only. Fix the system (doc, rule, block, linter) with `report-friction`.

## Figma MCP
- `create_session` once with the file key; pass the `sessionId` to every call.
- One `use_figma` per screen or per flow. The MCP is rate-limited; batch.
- Work from an account with a **Full or Dev seat** on the file's team: View and Collab seats get only a few MCP calls a month. `ds-doctor` checks this.
- Plugin API gotchas: `docs/figma-api.md`.
- After changing components or descriptions, a person republishes the library (Assets → Publish) before `search_design_system` sees it.

## Where to work
Build on page **Polygon**, one section per task, named `Polygon · <task> · <date>` (the bundler does this). Never edit Components, Foundations or Examples without being asked.
