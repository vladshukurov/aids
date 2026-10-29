// Audit screens in the re:verse DS file. Paste into one use_figma call with FRAME_IDS set.
// Errors must be fixed; warnings are checked by eye. Rules: AGENTS.md, foundations/layout.md, components/*.md.
const FRAME_IDS = ['REPLACE_ME'];
const SCALE = [2, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80];
const KIT = ['Button', 'Cell', 'Cell Small', 'TopBar', 'StatusBar', 'HomeIndicator', 'BottomBar', 'Card', 'Chip', 'Suggest', 'Avatar', 'Toggle', 'Badge', 'Section header', 'Alert', 'SheetBar'];
figma.skipInvisibleInstanceChildren = false;
const first = await figma.getNodeByIdAsync(FRAME_IDS[0]);
let page = first; while (page && page.type !== 'PAGE') page = page.parent;
await figma.setCurrentPageAsync(page);
const colorCol = (await figma.variables.getLocalVariableCollectionsAsync()).find(c => c.name === 'Color');
const positive = (await figma.variables.getLocalVariablesAsync()).find(v => v.name === 'text/positive');
const setName = async i => { const m = await i.getMainComponentAsync(); return m ? (m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name : m.name) : ''; };
const prop = (i, p) => { const k = Object.keys(i.componentProperties || {}).find(x => x.split('#')[0] === p); return k ? i.componentProperties[k].value : undefined; };
const results = [];

for (const id of FRAME_IDS) {
  const f = await figma.getNodeByIdAsync(id);
  if (!f) { results.push({ frame: id, errors: ['frame not found'] }); continue; }
  const E = [], W = [];
  const inInst = n => { let q = n.parent; while (q && q !== f) { if (q.type === 'INSTANCE') return true; q = q.parent; } return false; };
  const visible = n => { let q = n; while (q && q !== f) { if (q.visible === false) return false; q = q.parent; } return true; };
  let instances = 0, own = 0;
  for (const n of f.findAll(() => true)) {
    if (n.type === 'INSTANCE' && !inInst(n)) instances++;
    if (inInst(n)) continue;
    const isSpacer = n.type === 'FRAME' && /^space\b/.test(n.name);
    if (n.type !== 'INSTANCE' && !isSpacer) own++;
    for (const key of ['fills', 'strokes']) if (key in n && Array.isArray(n[key])) for (const p of n[key])
      if (p.type === 'SOLID' && p.visible !== false && !(p.boundVariables && p.boundVariables.color)) E.push(`raw ${key.slice(0, -1)} on ${n.type} "${n.name}" (${n.id})`);
    if (n.type === 'TEXT' && !n.textStyleId) E.push(`text without style "${n.characters.slice(0, 24)}" (${n.id})`);
    if (n.type === 'FRAME' && n !== f && n.layoutMode === 'NONE' && n.children.length > 1) W.push(`frame without auto layout "${n.name}" (${n.id})`);
    if (n.type === 'FRAME' && KIT.includes(n.name)) E.push(`frame named "${n.name}" is not an instance — detached or hand-drawn? (${n.id})`);
    if (n.type === 'FRAME' && n.layoutMode !== 'NONE' && !isSpacer) {
      const bv = n.boundVariables || {};
      for (const k of ['itemSpacing', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight']) {
        const v = n[k]; if (!v || (k === 'itemSpacing' && n.primaryAxisAlignItems === 'SPACE_BETWEEN')) continue;
        if (!SCALE.includes(Math.round(v))) E.push(`${k} ${v} is off the spacing scale "${n.name}" (${n.id})`);
        else if (!bv[k]) W.push(`${k} ${v} not bound to space/* "${n.name}" (${n.id})`);
      }
    }
    if (n.type !== 'INSTANCE' && 'cornerRadius' in n && n !== f && typeof n.cornerRadius === 'number' && n.cornerRadius > 0 && !(n.boundVariables && (n.boundVariables.topLeftRadius || n.boundVariables.cornerRadius)))
      W.push(`radius ${n.cornerRadius} not bound to a Theme radius "${n.name}" (${n.id})`);
  }
  // copy rules on every visible text, instances included
  const isChatScreen = !!f.findOne(n => n.type === 'INSTANCE' && /Spirit \/ Chat background/.test(n.name));
  for (const t of f.findAllWithCriteria({ types: ['TEXT'] })) {
    if (!visible(t)) continue;
    const s = t.characters;
    if (/^(Button|Label|Placeholder|Text|Title|Suggestion|Cell Name|Caption)$/.test(s.trim()) || /Name[’']s |Lorem/.test(s)) E.push(`placeholder text "${s}" (${t.id})`);
    if (/Re:verse|RE:VERSE|Re:Verse/.test(s)) E.push(`brand must be lowercase: "${s.slice(0, 30)}" (${t.id})`);
    if (/\bSpirit\b/.test(s) && !isChatScreen) E.push(`"Spirit" in base UI: "${s.slice(0, 30)}" (${t.id})`);
    if (/success|successful|congratulations|done!/i.test(s)) E.push(`success copy — land on the object instead: "${s.slice(0, 30)}" (${t.id})`);
    if (/\*{2,}\s?\d{4}|··\d{4}|\.\.\.\d{4}/.test(s)) E.push(`card number must be "•••• 0020": "${s}" (${t.id})`);
    if (/^-\s?[€$£]/.test(s.trim())) E.push(`hyphen in an amount, use "−": "${s}" (${t.id})`);
    if (/\b\d{1,2}:\d{2}\b/.test(s) && t.parent && /status ?bar/i.test(t.parent.name + (t.parent.parent ? t.parent.parent.name : '')) && s.trim() !== '9:41') E.push(`status bar time "${s}" — must be 9:41 (${t.id})`);
  }
  // instance rules
  const names = [], primaries = [], families = new Set();
  let suggests = 0;
  for (const i of f.findAllWithCriteria({ types: ['INSTANCE'] })) {
    const nm = await setName(i); names.push(nm);
    if (!visible(i)) continue;
    if (nm === 'Button' && prop(i, 'Type') === 'Primary') primaries.push(i.id);
    if (nm === 'Suggest') suggests++;
    if (/^SF \//.test(i.name)) families.add(/\.fill\b/.test(i.name) ? 'fill' : 'outline');
    if (nm === 'Cell') {
      const amt = prop(i, 'Amount'), right = prop(i, 'Right');
      if (right && amt && prop(i, 'Chevron')) E.push(`row with an amount has a chevron "${prop(i, 'Cell Name')}" (${i.id})`);
      if (right && amt) {
        const t = i.findOne(n => n.type === 'TEXT' && n.characters === amt);
        const green = t && Array.isArray(t.fills) && t.fills.some(p => p.boundVariables && p.boundVariables.color && positive && p.boundVariables.color.id === positive.id);
        if (green && !/^\+/.test(amt.trim())) E.push(`green amount "${amt}" without "+" — green is only for money coming in (${i.id})`);
        if (!green && /^\+/.test(amt.trim())) W.push(`incoming "${amt}" is not text/positive (${i.id})`);
      }
      if (prop(i, 'Checkbox Left')) W.push(`selection on the left "${prop(i, 'Cell Name')}" — sheets use the right (${i.id})`);
    }
    if (nm === 'Card' && /^(S|XS)$/.test(String(prop(i, 'Size'))) && i.findOne(n => n.type === 'TEXT' && /•{4}\s?\d{4}/.test(n.characters) && n.visible)) E.push(`card ${prop(i, 'Size')} shows "•••• 0000" — S/XS show the last 4 only (${i.id})`);
    if (nm === 'BottomBar' && prop(i, 'Suggestions') === true) W.push(`BottomBar Suggestions is on (${i.id}); use a Suggest row or Block / Bottom chat`);
  }
  if (primaries.length > 1) E.push(`${primaries.length} visible Primary buttons (${primaries.join(', ')}); max one`);
  if (families.size > 1) W.push('outline and filled SF icons mixed — one family per screen (SF outline)');
  if (!isChatScreen && suggests > 2) W.push(`${suggests} suggestions on a base screen — max 2`);
  if (!names.includes('StatusBar')) E.push('no StatusBar');
  if (!names.some(n => /HomeIndicator|Home Indicator|Block \/ Bottom chat/.test(n))) W.push('no HomeIndicator');
  if (isChatScreen) {
    const modeId = f.explicitVariableModes && colorCol && f.explicitVariableModes[colorCol.id];
    const mode = modeId && colorCol.modes.find(m => m.modeId === modeId);
    if (!mode || mode.name !== 'dark') E.push('chat screen must be in Color mode dark (set it on the screen frame)');
  }
  // groups: one-row sections and empty bands
  for (const g of f.findAll(n => n.type === 'FRAME' && /^Group ·/.test(n.name))) {
    const rows = g.findOne(n => n.type === 'FRAME' && n.name === 'Rows');
    if (rows && rows.children.filter(c => c.visible).length < 2) W.push(`one-row section "${g.name}" — merge it (${g.id})`);
  }
  const content = f.findOne(n => n.type === 'FRAME' && n.name === 'Content');
  if (content) {
    let band = 0;
    for (const c of content.children) {
      if (!c.visible) continue;
      if (c.type === 'FRAME' && /^space\b/.test(c.name) && c.name !== 'space bottom chat') { band += c.height; continue; }
      if (band > 96) W.push(`empty band ${Math.round(band)} px before "${c.name}" — max 96`);
      band = 0;
    }
  }
  if (Math.round(f.width) !== 402) W.push(`width ${f.width}, expected 402`);
  if (f.height < 874) W.push(`height ${f.height} < 874`);
  results.push({ frame: id, name: f.name, instances, ownNodes: own, instanceShare: +(instances / Math.max(1, instances + own)).toFixed(2), errors: E.slice(0, 30), warnings: W.slice(0, 20) });
}
return results;
