---
name: build-screen
description: Build one mobile banking screen in the re:verse DS Figma file from a text request ("make a send-money screen", "card screen frozen", "Spirit answer about October spending"). Use for any single-screen request in this repo. Not for multi-screen flows from a brief (use build-flow) and not for reviewing an existing screen (use audit-screen).
---

# Build a screen

## 0. Setup (once per session)
- Figma file key: `qUknPCIey4DG3PH19e1OmD`. Call `create_session` with it.
- Load the Figma skills `figma-use` (and `figma-generate-design`) before the first `use_figma`.
- If there are two Figma MCP servers, run `whoami` on both and use the one with an editor seat on this file.
- Read `CLAUDE.md`, then `recipes/overview.md`.

## 1. Plan on paper (in your reply, short)
- Pick the recipe. Name it.
- List the screen top to bottom: component + property values + text.
- Write all numbers and check they add up. Use the persona Alex Morgan, EUR.

## 2. Find components
Components live on page `Components` (`0:1`), examples on `Examples` (`14:989`).
Run `search_design_system` with one intent per query ("list row", "primary button", "bottom sheet header"). If search returns nothing for a local component, list it directly:
```js
const p = await figma.getNodeByIdAsync('0:1'); await figma.setCurrentPageAsync(p);
return p.findAllWithCriteria({types:['COMPONENT_SET','COMPONENT']})
  .filter(c => c.type==='COMPONENT_SET' || c.parent.type!=='COMPONENT_SET')
  .filter(c => !c.name.startsWith('_'))
  .map(c => ({id:c.id, name:c.name, description:c.description.slice(0,80)}));
```
Read `components/<name>.md` for every component you use for the first time.

## 3. Build on page Polygon (`14:990`)
- Place the new frame to the right of existing frames, 120 gap. Name it `<Recipe> · <what>`.
- Frame: 402×874, vertical auto layout, fill bound to `Color/background/primary`, clip content. Dark (chat) screens: `setExplicitVariableModeForCollection(Color, dark)`.
- Only instances of components (`component.createInstance()` or `variant.createInstance()`) and auto-layout wrapper frames.
- Change text via `instance.setProperties({'Label#…': 'Send €40'})`. Get exact property keys from `componentProperties`. If a text has no property, override `characters` on the nested text node (load its font first). Never detach.
- Append to the auto-layout parent first, then set `layoutSizingHorizontal='FILL'`.
- Spacing and padding: bind to `Size/space/*`. Colors of your wrapper frames: bind to `Color/*`. No raw hex.
- Build the whole screen in one `use_figma` call when possible; return created ids.

## 4. Check
- Run `scripts/audit-screen.js` (paste its body into `use_figma`, set `FRAME_ID`). Fix every error it reports.
- Take one screenshot at scale 0.5. Look for clipped text, wrong mode, leftovers ("Button", "Label", "Name's").
- Score yourself with `evals/rubric.md` and report: recipe used, components used, audit result, anything you could not do.

## Never
- Draw a component by hand when one exists. Draw shapes for glow or gradients.
- Add a success screen. Name "Spirit" outside the chat.
- Use green for anything but incoming money.
