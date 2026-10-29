// Dump the library of one page for state/library.json. Run once per page, in parallel:
// Components (0:1) and _internal (11:46179), PAGE_ID from state/figma.json. TOKENS = true on one of them.
// Save each result as .out/lib-<page>.json, then: node scripts/merge-library.mjs .out/lib-*.json
const PAGE_ID = 'REPLACE_ME';
const TOKENS = false;
const page = await figma.getNodeByIdAsync(PAGE_ID);
await figma.setCurrentPageAsync(page);
const components = {}, icons = {}, dupes = [];
const all = page.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] });
for (const n of all) {
  if (n.type === 'COMPONENT' && n.parent && n.parent.type === 'COMPONENT_SET') continue;
  if (/^(SF|Icon) \//.test(n.name)) { icons[n.name] = n.id; continue; }
  if (components[n.name]) { dupes.push(n.name + ' ' + n.id); continue; }
  const props = {};
  for (const [k, d] of Object.entries(n.componentPropertyDefinitions || {})) {
    const name = k.split('#')[0];
    props[name] = d.type === 'VARIANT' ? d.variantOptions.join('|') : d.type === 'TEXT' ? 'TEXT' : d.type === 'BOOLEAN' ? 'BOOLEAN' : 'SWAP';
  }
  const base = n.type === 'COMPONENT_SET' ? n.defaultVariant : n;
  const nested = base ? [...new Set(base.findAll(x => x.type === 'INSTANCE' && x.isExposedInstance).map(x => x.name))] : [];
  let sec = n.parent; while (sec && sec.type !== 'SECTION' && sec.type !== 'PAGE') sec = sec.parent;
  components[n.name] = { id: n.id, key: n.key, set: n.type === 'COMPONENT_SET', section: sec && sec.type === 'SECTION' ? sec.name : '', props, nested, description: (n.description || '').slice(0, 160) };
}
const out = { page: page.name, components, icons, dupes };
if (TOKENS) {
  out.variables = {};
  for (const c of await figma.variables.getLocalVariableCollectionsAsync()) out.variables[c.name] = { modes: c.modes.map(m => m.name), count: c.variableIds.length };
  out.variableNames = (await figma.variables.getLocalVariablesAsync()).filter(v => !v.hiddenFromPublishing).map(v => v.name);
  out.textStyles = (await figma.getLocalTextStylesAsync()).map(s => s.name);
}
return out;
