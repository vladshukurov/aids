---
name: build-screen
description: Build one mobile banking screen in the re:verse DS Figma file from a text request ("make a send-money screen", "card screen frozen", "Spirit answer about October spending"). Use for any single-screen request in this repo. Not for multi-screen flows from a brief (use build-flow) and not for reviewing an existing screen (use audit-screen).
---

# Build a screen

## 0. Setup (once per session)
- Figma file key: `qUknPCIey4DG3PH19e1OmD`. Call `create_session` with it.
- Load the Figma `figma-use` skill before the first `use_figma`: via the `/figma-use` skill, `get_figma_skill`, or the MCP resource `skill://figma/figma-use/SKILL.md` — whichever your environment has.
- If there are two Figma MCP servers, run `whoami` on both and use the one with an editor seat on this file.
- Read `CLAUDE.md`, `foundations/persona.md`, then `recipes/overview.md`.

## 1. Plan on paper (in your reply, short)
- Pick the recipe. Name it.
- List the screen top to bottom: component + property values + text.
- Take every number and name from `foundations/persona.md`; check before → after math.

## 2. Find components, variables, styles
Try `search_design_system` first (one intent per query). IMPORTANT: if the library is not published it returns nothing — then look things up by name in the file. One read call that gives you everything:
```js
const comp = figma.root.children.find(p => p.name === 'Components'); await comp.loadAsync();
const ex = figma.root.children.find(p => p.name === 'Examples'); await ex.loadAsync();
const owners = [...comp.findAllWithCriteria({types:['COMPONENT_SET','COMPONENT']}), ...ex.findAllWithCriteria({types:['COMPONENT']})]
  .filter(c => (c.type === 'COMPONENT_SET' || c.parent.type !== 'COMPONENT_SET') && !c.name.startsWith('_'));
const vars = await figma.variables.getLocalVariablesAsync();
const styles = await figma.getLocalTextStylesAsync();
return {
  components: owners.map(c => ({id: c.id, name: c.name, desc: c.description.slice(0, 120)})),
  variables: vars.filter(v => !v.name.startsWith('neutral') ).map(v => v.name).length,
  textStyles: styles.map(s => s.name)
};
```
Then, inside your build script, resolve objects by name — never hardcode style or variable ids (style ids end with a comma and break when copied):
```js
const V = n => vars.find(v => v.name === n);            // e.g. V('background/primary'), V('space/16')
const S = n => styles.find(s => s.name === n);          // then: await text.setTextStyleIdAsync(S('Body/Small').id)
```
Component property keys carry a suffix (`Label#4376:0`). Set them by prefix:
```js
const setP = (inst, map) => { const keys = Object.keys(inst.componentProperties); const out = {};
  for (const [k, v] of Object.entries(map)) { const key = keys.find(x => x === k || x.startsWith(k + '#')); if (key) out[key] = v; }
  inst.setProperties(out); };
```
Read `components/<name>.md` for every component you use for the first time.

## 3. Build on page Polygon
- Place the new frame to the right of existing frames, 120 gap. Name it `<Recipe> · <what>`.
- Frame: 402×874, vertical auto layout, fill bound to `background/primary`, clip content. Chat screens: frame in `Color` mode `dark`, first child `Spirit / Chat background` (absolute, 0,0).
- Only component instances and auto-layout wrapper frames; text you add yourself gets a text style and a `Color` text variable.
- Text in instances: component properties via `setP`. Nested exposed instances (e.g. `Title` inside `TopBar`) appear in `componentProperties` of the parent too. If a text has no property, override `characters` on the nested text node (load its font first). Never detach.
- Append to the auto-layout parent first, then set `layoutSizingHorizontal='FILL'`.
- Gaps and padding: bind to `space/*`. No raw hex.
- Build the whole screen in one `use_figma` call when possible; return created ids.

## 4. Check
- Run `scripts/audit-screen.js` (paste its body into `use_figma`, set `FRAME_ID`). Fix every error.
- One screenshot at scale 0.5. Look for clipped text, wrong mode, leftovers.
- Report: recipe, components, audit result, rubric score (`evals/rubric.md`), anything you could not do or had to guess.

## Never
- Draw a component by hand when one exists. Draw shapes for glow or gradients.
- Add a success screen. Name "Spirit" outside the chat.
- Use green for anything but incoming money.
