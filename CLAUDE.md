# re:verse DS — agent rules

You are building mobile banking screens in Figma from the re:verse design system.
Read this file first. Then open `llms.txt` and read only the files your task needs.

## Source of truth
- **Figma file:** `qUknPCIey4DG3PH19e1OmD` ("AI-ready DS"). Page and node ids: `state/figma-ledger.json`.
- **Tokens:** local variable collections in that file. Never use a raw hex, size or font if a variable exists.
- **Components:** local components in that file. Never draw a component by hand if one exists.
- **Rules and recipes:** this repo. Figma descriptions are short; the md files are the full contract.
- **Data:** `foundations/persona.md`. One person, one day; take every name and number from there.

## Workflow (every screen)
1. Read the recipe in `recipes/` that matches the request. No recipe → read the nearest one and say so.
2. Find every component the recipe lists: `search_design_system` when the library is published (`libraryPublished` in the ledger), otherwise the lookup script in `.claude/skills/build-screen/SKILL.md`.
3. Build in the Polygon page: a 402×874 frame, auto layout, instances + bound variables only.
4. Self-check with `evals/rubric.md` and one screenshot. Fix, then report.

## Hard rules
IMPORTANT: these break the brand when ignored.
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
- Invent a component property that is not listed in `components/<name>.md`.
