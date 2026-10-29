---
name: ds-doctor
description: Check that this machine and account can work with the re:verse DS — Node, Figma MCP connection, seat and rate limits, file access, library freshness, fonts, docs consistency — and say exactly what to fix. Use on first setup, when Figma calls fail, or when a teammate says "it doesn't work".
---

# DS doctor

Run every check, then print one table: check → ok / problem → fix. Stop at nothing; collect all problems.

1. **Node.** `node --version` ≥ 18. `node scripts/check-docs.mjs` → consistent? (problems here are repo problems, not setup ones).
2. **Figma MCP connected.** A Figma tool is available (`whoami`). None → the setup in `docs/setup.md` (Claude Code: `.mcp.json` + `/mcp` login; Codex: `.codex/config.toml` + `codex mcp login figma`).
3. **Seat.** `whoami` → the plan that owns the file must give a **Full or Dev** seat. View/Collab → "a few MCP calls a month; ask the file owner for a Full or Dev seat". Several Figma servers → check each, name the one to use.
4. **File access.** `create_session` on `qUknPCIey4DG3PH19e1OmD`, then one read-only `use_figma`:
   ```js
   const c = await figma.getNodeByIdAsync('7:1182');
   const cols = await figma.variables.getLocalVariableCollectionsAsync();
   const fonts = []; for (const f of [['Geist','Regular'],['Geist','Medium'],['Geist Mono','Regular']]) { try { await figma.loadFontAsync({family:f[0],style:f[1]}); fonts.push(f.join(' ')+' ok'); } catch(e) { fonts.push(f.join(' ')+' MISSING'); } }
   return { button: c ? c.name : 'not found', collections: cols.map(x => x.name), fonts, editor: figma.editorType };
   ```
   `not found` → no access to the file or wrong file. Missing fonts → install Geist / Geist Mono (Manrope and IBM Plex Mono for the Atlas theme) where Figma runs.
5. **Library freshness.** `state/library.json` → `generated`. Null or older than the last library change → run `sync-library`.
6. **Renderer smoke test** (only if 1–5 pass): `node scripts/build-call.mjs specs/examples/chat-salary.json --section "Polygon · doctor" --no-shots` → run it → `log` must be empty. Delete the `Polygon · doctor` section afterwards (it is yours).
