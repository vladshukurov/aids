---
name: build-screen
description: Design and build one mobile banking screen in the re:verse DS Figma file from a text request — including screens no recipe covers ("profile", "subscriptions", "card frozen", "Spirit answer about October"). Plans the composition first, builds from blocks, then iterates with an independent visual critic. Not for multi-screen flows (build-flow) or reviewing an existing screen (audit-screen).
---

# Build a screen

The goal is a screen that looks designed, not assembled. Rule compliance is the floor; the critic decides when it is good.

## 0. Setup (once per session)
- Figma file `qUknPCIey4DG3PH19e1OmD`: `create_session`, pass `sessionId` to every Figma call. Load Figma skills `figma-use` and `figma-generate-design` (`/figma-use`, `get_figma_skill` or `skill://figma/<name>/SKILL.md`).
- Two Figma MCP servers → `whoami` on both, use the one with an editor seat.
- Read `CLAUDE.md`, `foundations/layout.md`, `foundations/anti-patterns.md`, `foundations/persona.md`, `components/blocks.md`, then the closest recipe in `recipes/overview.md` (if any).

## 1. Plan (write it in your reply before any Figma call)
1. Archetype (layout.md §2) and the product reference to compare with (`evals/references.md`).
2. The six answers of layout.md §1: object, hero, actions, sections, state, next step.
3. **ASCII sketch** with zone heights and gaps, e.g.
```
StatusBar 62 · TopBar 58 (Back, "CARD •••• 0020")
── 40 ── Hero: Card L
── 24 ── Actions: [Unfreeze] [Details] [···]
── 48 ── Card: Card is frozen · … | Show PIN › | Limits › | Replace card ›
── 48 ── Transactions · View all: Vapiano €31.50 | … (3 rows)
Bottom chat: "Why was it declined?" "Freeze for how long?"
```
4. **Data inventory:** every row's title, caption and value from `persona.md`. Captions must state a fact or a consequence.
5. **Plan review:** read the sketch against `anti-patterns.md`. Anything default, empty, one-row, invented or Spirit-named? Fix the plan, not the screen later.

## 2. Find components
One batched `search_design_system` call (library is published): blocks first ("Block / List group", "Block / Hero amount"), then atoms. Results include descriptions — they are the short contract. Resolve objects by name inside your build script; never hardcode style or variable ids:
```js
const V = n => vars.find(v => v.name === n);   const S = n => styles.find(s => s.name === n);
const setP = (inst, map) => { const keys = Object.keys(inst.componentProperties); const out = {};
  for (const [k, v] of Object.entries(map)) { const key = keys.find(x => x === k || x.startsWith(k + '#')); if (key) out[key] = v; }
  inst.setProperties(out); };
```
Exposed nested instances (Row 1–5 in a List group, Action 1/2, Header, Avatar and Toggle inside Cell) are found with `findOne(n => n.name === 'Row 1')` and set with `setP` on them. Icons: swap the icon inside an Avatar plate with an `SF / *` outline icon (one family per screen). Search all pages for icons — some live on `_internal`.
Working in another file → import by the keys search returns (`importComponentSetByKeyAsync` …).

## 3. Build on page Polygon
- Frame 402 wide, vertical auto layout, `background/primary`, height 874 or taller if content needs it. Chat: `Color` mode dark + `Spirit / Chat background` first.
- Blocks first: `Block / Hero amount` (or Card L / custom hero), `Block / Action row`, `Block / List group` ×2–4, `Block / Bottom chat` (absolute at the bottom; bottom space = its height − 40). Sheets: `Block / Option sheet` over the dimmed object screen.
- Spacing exactly as layout.md §3 (40–60 / 24 / 48 / 12 / 20), bound to `space/*`.
- One `use_figma` call for the whole screen; return the frame id.

## 4. Check, then critic
1. Run `scripts/audit-screen.js` in its own call; fix every error.
2. Screenshot at 0.5 and check `anti-patterns.md` yourself; fix obvious slips (truncation, overlaps, mixed icons).
3. **Independent critic:** spawn the `screen-critic` agent with the frame id, archetype and reference. Never grade visual quality yourself — builders overrate their own work.
4. Apply its fixes on a **copy** of the frame (`<name> · round N`), re-run the critic on the copy. Keep a round only if its average went up. Max 3 rounds; ship when every score ≥ 8.
5. Report: plan, components, audit result, critic scores per round, what you could not do or guessed.

## Never
- Draw a component, icon, glow or gradient by hand when one exists.
- Add a success screen. Name "Spirit" outside the chat. Use green for anything but incoming money.
- Leave a spacer pushing a button down on an Object screen, or a one-row section.
