# Figma Plugin API — gotchas for this file

For agents writing `use_figma` code by hand (anything the renderer doesn't cover). Load the Figma `figma-use` skill first; this file adds what we learned on re:verse.

## The installed renderer
The renderer lives in the file: `figma.root.getSharedPluginData('reverse_ds', 'renderer')`, version in `'renderer_hash'`. A call runs it with `new AsyncFunction('SPECS', 'OPTS', src)`. `scripts/build-call.mjs` writes the call, the full install and (with `--patch-from`) a line-hunk patch; local copies of each version are kept in `.out/renderer-<hash>.txt`. Never edit the installed text by hand: change `scripts/figma/render.js`, rebuild, patch.

## Session, limits, batching
- `create_session` once with the file key; pass the same `sessionId` on every call.
- A View/Collab seat gets a few MCP calls a month; work from a Full or Dev seat. Several Figma servers connected → `whoami` on each, use the one that can edit.
- One `use_figma` call should do a whole step (a screen, a flow, an audit of many frames). Max 50,000 characters of code.
- Calls are atomic: an uncaught error rolls back the whole call. Wrap per-screen work in `try/catch` and collect errors in the return value — but then check the result, because partial changes stay.
- Switch pages at most once per call (`await figma.setCurrentPageAsync(page)`); fan multi-page work out into parallel calls.
- Not available: `figma.notify`, `loadAllPagesAsync`, `setPluginData`, `createImageAsync`. To reuse a photo, copy the `fills` of a layer that already has it.
- `await node.screenshot({ scale: 0.5 })` returns an image inline — cheaper than a separate `get_screenshot`.

## Nodes and text
- Start scripts with `figma.skipInvisibleInstanceChildren = false`, or hidden instance children are invisible to `findAll`.
- Load fonts before editing text: `for (const f of t.getRangeAllFontNames(0, Math.max(1, t.characters.length))) await figma.loadFontAsync(f)`. Empty text breaks `getRangeAllFontNames` — fall back to `t.fontName`.
- Text styles: `await t.setTextStyleIdAsync(style.id)`; ranges: `await t.setRangeTextStyleIdAsync(a, b, id)`. Resolve styles and variables **by name** (`getLocalTextStylesAsync`, `getLocalVariablesAsync`) — never hardcode ids (style ids end with a comma and change between files).
- Colour tokens: `figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', variable)` returns a new paint — assign it.
- Spacing tokens: `frame.setBoundVariable('itemSpacing', V('space/24'))`, same for paddings and a spacer's `height`.
- `resize()` after AUTO sizing makes a frame fixed again: resize first, then set sizing modes. Children: append first, then `layoutSizingHorizontal = 'FILL'`.
- `findAll` on a TEXT node throws; check `'findAll' in node`.
- Names may contain non-breaking spaces from earlier edits — match with a regex, not `===`.
- Keep "amount + word", names and dates on one line with a non-breaking space (U+00A0).

## Components and instances
- Property keys carry a suffix (`Cell Name#6230:17`): find them with `Object.keys(i.componentProperties).find(k => k.split('#')[0] === 'Cell Name')`. Variant keys have no suffix.
- Read `componentPropertyDefinitions` only on a COMPONENT_SET (or a standalone COMPONENT), never on a variant.
- Exposed nested instances (`Row 1` in a List group, `Avatar` and `Selection` in a Cell) are found with `inst.findOne(n => n.type === 'INSTANCE' && n.name === 'Row 1')` and set with their own `setProperties`.
- An invalid variant combination throws "Unable to find a variant": set Type and Style together (Avatar) and read the valid values in `components/_properties.md`.
- Swapping an avatar to an icon: set `Type=Transaction, Style=Plus` first, then `swapComponent` the glyph with an `SF / *` icon.
- Never `detachInstance()`. Never append children into an instance — wrap it in an auto-layout frame.

## Variable modes
- Light/dark, Theme and Spirit persona are modes set on the screen frame: `frame.setExplicitVariableModeForCollection(collection, modeId)`. Chat screens are `Color` = dark.
- Blend modes don't survive on a fill bound to a variable (the iOS keyboard is therefore not on tokens).

## Canvas
- Sections: `figma.createSection()`, children use section-relative x/y, grow with `resizeWithoutConstraints`. Keep 400 px between sections.
- Screens in a row: x = 120 + column × 522, caption text 24 above each screen.
- Prototype links: `await node.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [{ type: 'NODE', destinationId, navigation: 'NAVIGATE', transition: { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.25 } }] }])`.
- After any bulk edit, screenshot what it touched before claiming it worked.
