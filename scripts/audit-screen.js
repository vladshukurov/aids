// Audit one screen frame in the re:verse DS file. Paste into use_figma, set FRAME_ID.
// Returns errors (must fix) and warnings (check by eye).
const FRAME_ID = 'REPLACE_ME';
const f = await figma.getNodeByIdAsync(FRAME_ID);
let page = f; while (page.type !== 'PAGE') page = page.parent;
await figma.setCurrentPageAsync(page);

const errors = [], warnings = [];
const insideInstance = n => { let q = n.parent; while (q && q !== f) { if (q.type === 'INSTANCE') return true; q = q.parent; } return false; };
const all = f.findAll(() => true);
let instances = 0, own = 0;

for (const n of all) {
  if (n.type === 'INSTANCE' && !insideInstance(n)) instances++;
  if (insideInstance(n)) continue;
  if (n.type !== 'INSTANCE') own++;
  // raw colors on own nodes
  if ('fills' in n && Array.isArray(n.fills)) for (const p of n.fills)
    if (p.type === 'SOLID' && p.visible !== false && !(p.boundVariables && p.boundVariables.color))
      errors.push(`raw fill on ${n.type} "${n.name}" (${n.id})`);
  // text without a style
  if (n.type === 'TEXT' && !n.textStyleId) errors.push(`text without style "${n.characters.slice(0, 24)}" (${n.id})`);
  // absolute frames with several children
  if (n.type === 'FRAME' && n !== f && n.layoutMode === 'NONE' && n.children.length > 1)
    warnings.push(`frame without auto layout "${n.name}" (${n.id})`);
  // spacing not bound
  if ((n.type === 'FRAME') && n.layoutMode !== 'NONE' && n.itemSpacing > 0 && !(n.boundVariables && n.boundVariables.itemSpacing))
    warnings.push(`gap ${n.itemSpacing} not bound "${n.name}" (${n.id})`);
}
// placeholders and brand rules anywhere in the frame
for (const t of f.findAllWithCriteria({ types: ['TEXT'] })) {
  const s = t.characters;
  if (/^(Button|Label|Placeholder|Text|Title|Suggestion)$/.test(s) || /Name[’']s |Lorem/.test(s)) errors.push(`placeholder text "${s}" (${t.id})`);
  if (/Re:verse|RE:VERSE|Re:Verse/.test(s)) errors.push(`brand must be lowercase: "${s.slice(0, 30)}" (${t.id})`);
  if (/\bSpirit\b/.test(s)) warnings.push(`"Spirit" in text — allowed only inside the chat: "${s.slice(0, 30)}" (${t.id})`);
}
// one visible Primary per screen, nested ones included (e.g. inside TopBar)
const visibleChain = n => { let q = n; while (q && q !== f) { if (q.visible === false) return false; q = q.parent; } return true; };
const primaries = [];
for (const n of f.findAllWithCriteria({ types: ['INSTANCE'] })) {
  if (!n.componentProperties || !visibleChain(n)) continue;
  if (!Object.entries(n.componentProperties).some(([k, v]) => k === 'Type' && v.value === 'Primary')) continue;
  const m = await n.getMainComponentAsync();
  const set = m && m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name : '';
  if (set === 'Button') primaries.push(n.id);
}
if (primaries.length > 1) errors.push(`${primaries.length} visible Primary buttons (${primaries.join(', ')}); max one`);
// status bar and home indicator
const names = await Promise.all(f.findAllWithCriteria({ types: ['INSTANCE'] }).map(async i => { const m = await i.getMainComponentAsync(); return m ? (m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name : m.name) : ''; }));
if (!names.includes('StatusBar')) errors.push('no StatusBar');
// chat screens are dark-only
if (names.includes('Spirit / Chat background')) {
  const colorCol = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Color');
  const modeId = f.explicitVariableModes && f.explicitVariableModes[colorCol.id];
  const mode = modeId && colorCol.modes.find(m => m.modeId === modeId);
  if (!mode || mode.name !== 'dark') errors.push('chat screen must be in Color mode dark (set it on the screen frame)');
}
// legacy chips inside BottomBar
for (const i of f.findAllWithCriteria({ types: ['INSTANCE'] })) {
  if (!i.componentProperties) continue;
  const k = Object.keys(i.componentProperties).find(x => x.startsWith('Suggestions#'));
  if (k && i.componentProperties[k].value === true) warnings.push(`BottomBar Suggestions is on (${i.id}); new screens keep it off and use a Suggest row above`);
}
if (!names.some(n => /HomeIndicator|Home Indicator/.test(n))) warnings.push('no HomeIndicator');
if (Math.round(f.width) !== 402) warnings.push(`width ${f.width}, expected 402`);

return { instances, ownNodes: own, instanceShare: +(instances / Math.max(1, instances + own)).toFixed(2), errors: errors.slice(0, 30), warnings: warnings.slice(0, 20) };
