// re:verse DS renderer: screen specs (specs/format.md) → Figma frames built from library instances.
// Never paste this file by hand. `node scripts/build-call.mjs <spec.json…>` bundles it with
// LIB (state/library.json subset), SPECS and OPTS into .out/call.js for one use_figma call.
// Every problem is reported in the returned `log`; a non-empty log means the screen is not done.

figma.skipInvisibleInstanceChildren = false;
const LOG = [];
const warn = m => { if (LOG.length < 150 && !LOG.includes(m)) LOG.push(m); };
const byId = id => figma.getNodeByIdAsync(id).catch(() => null);

// ---------- library: variables, styles, fonts, components ----------
const VARS = {}, COLS = {}, TS = {}, FONTS = new Set(), CACHE = {};
async function loadFont(f) {
  if (!f || typeof f !== 'object' || f === figma.mixed) return;
  const k = f.family + '|' + f.style; if (FONTS.has(k)) return; FONTS.add(k);
  try { await figma.loadFontAsync(f); } catch (e) { warn('font ' + k + ' not available'); }
}
async function fonts(n) {
  const ts = n.type === 'TEXT' ? [n] : ('findAllWithCriteria' in n ? n.findAllWithCriteria({ types: ['TEXT'] }) : []);
  for (const t of ts) {
    try { for (const f of t.getRangeAllFontNames(0, Math.max(1, t.characters.length))) await loadFont(f); }
    catch (e) { await loadFont(t.fontName); }
  }
}
async function loadLibrary() {
  for (const c of await figma.variables.getLocalVariableCollectionsAsync()) COLS[c.name] = c;
  for (const v of await figma.variables.getLocalVariablesAsync()) if (!VARS[v.name]) VARS[v.name] = v;
  for (const s of await figma.getLocalTextStylesAsync()) { TS[s.name] = s; await loadFont(s.fontName); }
  for (const f of OPTS.fonts || []) await loadFont(f);
}
async function comp(name) {
  if (name in CACHE) return CACHE[name];
  const ref = typeof LIB.components[name] === 'string' ? { id: LIB.components[name] } : LIB.components[name];
  let c = ref && ref.id ? await byId(ref.id) : null;
  if (!c && ref && ref.key) {
    try { c = ref.set ? await figma.importComponentSetByKeyAsync(ref.key) : await figma.importComponentByKeyAsync(ref.key); } catch (e) {}
  }
  if (!c) warn('component "' + name + '" not found: run the library dump (sync-library skill)');
  return (CACHE[name] = c);
}
async function make(name, props) {
  const c = await comp(name); if (!c) return null;
  const main = c.type === 'COMPONENT_SET' ? c.defaultVariant : c;
  const i = main.createInstance();
  await fonts(i);
  if (props) set(i, props, name);
  return i;
}
async function iconNode(name) {
  if (!name) return null;
  const I = LIB.icons || {};
  const id = I[name] || I['SF / ' + name] || I['Icon / ' + name];
  if (!id) { warn('icon "' + name + '" not in the library (components/icons.md)'); return null; }
  return byId(id);
}

// ---------- component properties ----------
function pkey(i, p) {
  const ks = Object.keys(i.componentProperties || {}), low = p.toLowerCase();
  return ks.find(k => k.split('#')[0] === p) || ks.find(k => k.split('#')[0].toLowerCase() === low);
}
// set(instance, {Prop: value}). "Prop?" = optional, no warning when the component lacks it.
function set(i, props, label) {
  if (!i) return;
  const out = {};
  for (let [p, v] of Object.entries(props)) {
    if (v === undefined || v === null) continue;
    const opt = p.endsWith('?'); if (opt) p = p.slice(0, -1);
    const k = pkey(i, p);
    if (!k) { if (!opt) warn((label || i.name) + ': no property "' + p + '"'); continue; }
    const t = i.componentProperties[k].type;
    out[k] = t === 'BOOLEAN' ? !!v : t === 'TEXT' && typeof v !== 'object' ? glue(String(v)) : t === 'VARIANT' ? String(v) : v;
  }
  if (!Object.keys(out).length) return;
  try { i.setProperties(out); } catch (e) {
    for (const [k, v] of Object.entries(out)) {
      try { i.setProperties({ [k]: v }); } catch (e2) { warn((label || i.name) + ': ' + k.split('#')[0] + '=' + JSON.stringify(v) + ' rejected'); }
    }
  }
}
function swap(i, prop, comp) {
  if (!i || !comp) return;
  const k = Object.keys(i.componentProperties || {}).find(x => i.componentProperties[x].type === 'INSTANCE_SWAP' && x.split('#')[0].replace(/^→\s*/, '') === prop);
  if (k) { try { i.setProperties({ [k]: comp.id }); } catch (e) { warn(i.name + ': swap ' + prop + ' rejected'); } }
  else warn(i.name + ': no swap property "' + prop + '"');
}
const sub = (i, name) => i ? i.findOne(n => n.type === 'INSTANCE' && n.name === name) : null;
function textOf(i, prop) {
  const k = pkey(i, prop); if (!k) return null;
  return i.findOne(n => n.type === 'TEXT' && n.componentPropertyReferences && n.componentPropertyReferences.characters === k);
}
// Text without a component property (legacy parts): override by layer name, else the n-th text.
async function setText(i, layer, value, nth) {
  if (!i || value === undefined) return null;
  const all = i.findAllWithCriteria({ types: ['TEXT'] });
  const t = layer ? all.find(n => n.name === layer) : all[nth || 0];
  if (!t) { warn(i.name + ': no text layer "' + (layer || '#' + (nth || 0)) + '"'); return null; }
  await fonts(t); t.characters = glue(String(value)); return t;
}

// Line-break hygiene (foundations/quality.md §3): no function word at a line end, no one-word last line,
// card numbers and dates never split. Applied to every text the renderer writes.
const NB = '\u00A0';
function glue(s) {
  if (typeof s !== 'string' || s.length < 12) return s;
  s = s.replace(/•••• (\d{4})/g, '••••' + NB + '$1').replace(/(\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/g, '$1' + NB + '$2');
  s = s.replace(/(^|\s)(a|an|to|of|in|at|the|on|by|for|with) (?=\S)/gi, (m, sp, w) => sp + w + NB);
  const i = s.lastIndexOf(' ');
  if (i > 0 && s.length - i <= 8) s = s.slice(0, i) + NB + s.slice(i + 1);
  return s;
}

// ---------- tokens ----------
function paint(name) {
  const v = VARS[name];
  if (!v) { warn('no color variable ' + name); return { type: 'SOLID', color: { r: 1, g: 0, b: 1 } }; }
  return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v);
}
function num(n, field, px, varName) {
  n[field] = px;
  if (!px) return;
  const v = VARS[varName || 'space/' + px];
  if (v) n.setBoundVariable(field, v); else warn('no variable ' + (varName || 'space/' + px));
}
function box(dir, name, gap) {
  const f = figma.createAutoLayout(dir, { name }); f.fills = [];
  if (gap) num(f, 'itemSpacing', gap);
  return f;
}
function pad(f, t, side, b) {
  num(f, 'paddingTop', t); num(f, 'paddingBottom', b);
  if (side === 16) { num(f, 'paddingLeft', 16, 'space/screen margin'); num(f, 'paddingRight', 16, 'space/screen margin'); }
  else { num(f, 'paddingLeft', side); num(f, 'paddingRight', side); }
}
function add(parent, child, fill) {
  if (!child) return null;
  parent.appendChild(child);
  if (fill !== false) { try { child.layoutSizingHorizontal = 'FILL'; } catch (e) {} }
  return child;
}
function spacer(px, name) {
  const s = figma.createFrame(); s.name = name || 'space ' + px; s.fills = []; s.resize(1, px);
  const v = VARS['space/' + px]; if (v) s.setBoundVariable('height', v); else if (!name) warn('no variable space/' + px);
  return s;
}
async function txt(s, style, color, ranges) {
  const t = figma.createText(); const st = TS[style];
  if (st) { await loadFont(st.fontName); await t.setTextStyleIdAsync(st.id); } else { warn('no text style ' + style); await loadFont(t.fontName); }
  t.characters = glue(String(s)); t.fills = [paint(color || 'text/primary')];
  for (const [a, b, c] of ranges || []) t.setRangeFills(a, b, [paint(c)]);
  return t;
}
function wrapText(t) { try { t.layoutSizingHorizontal = 'FILL'; t.textAutoResize = 'HEIGHT'; } catch (e) {} }

// ---------- data ----------
const PEOPLE = OPTS.people || {};
const initials = n => n.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
async function avatar(av, a) {
  if (!av || !a) return;
  if (a.person) {
    const p = PEOPLE[a.person];
    if (!p) warn('person "' + a.person + '" is not in foundations/persona.md');
    const photo = p && p.photo;
    set(av, { Type: 'Avatar', Style: photo ? 'Image' : 'Default', 'Sublogo?': !!(p && p.onReverse) }, 'Avatar');
    if (photo && OPTS.photos && OPTS.photos[a.person]) {
      const src = await byId(OPTS.photos[a.person]);
      const dst = av.findOne(n => 'fills' in n && Array.isArray(n.fills) && n.fills.some(f => f.type === 'IMAGE'));
      if (src && dst && 'fills' in src) dst.fills = src.fills; else warn('photo of ' + a.person + ' not applied');
    }
    if (!photo) await setText(av, null, initials(a.person));
  } else if (a.currency) set(av, { Type: 'Currency', Style: a.currency, 'Sublogo?': a.sublogo !== false }, 'Avatar');
  else if (a.merchant) set(av, { Type: 'Transaction', Style: a.merchant, 'Sublogo?': false }, 'Avatar');
  else if (a.logo) set(av, { Type: 'Avatar', Style: 'Re:verse', 'Sublogo?': false }, 'Avatar');
  else if (a.goal) set(av, { Type: 'Transaction', Style: 'Goal', 'Sublogo?': false }, 'Avatar');
  else if (a.icon) {
    set(av, { Type: 'Transaction', Style: 'Plus', 'Sublogo?': false }, 'Avatar');
    const ic = await iconNode(a.icon);
    const gl = av.findAll(n => n.type === 'INSTANCE' && !/sublogo/i.test(n.name))[0];
    if (gl && ic) { gl.visible = true; gl.swapComponent(ic); } else if (ic) warn('avatar has no glyph to swap for ' + a.icon);
  }
}

// ---------- rows (Cell) ----------
const ROLES = {};
function role(sp, key, n) { if (n) (ROLES[sp.id] = ROLES[sp.id] || {})[key] = n; }
function rowKind(r) {
  if (r.kind) return r.kind;
  if (r.toggle !== undefined) return 'toggle';
  if (r.select) return 'select';
  if (r.amount) return 'money';
  if (r.button) return 'copy';
  return r.chevron === false ? 'state' : 'action';
}
async function row(i, r, sp) {
  if (!i) return;
  const k = rowKind(r);
  set(i, {
    'Cell Name': r.title, 'Caption': r.caption || '', 'Caption Left?': !!r.caption,
    'Right': !!(r.amount || r.button || r.badge), 'Amount': r.amount || '',
    'Caption Right': r.captionRight || '', 'Caption Right 2?': !!r.captionRight && !r.badge,
    'Chevron': k === 'action' && r.chevron !== false, 'Button?': !!r.button, 'Badge?': !!r.badge,
    'Checkbox Right?': k === 'select', 'Checkbox Left?': false, 'Toggle?': k === 'toggle' ? true : undefined
  }, 'Cell "' + r.title + '"');
  if (r.amount && /^\+/.test(r.amount.trim())) { const t = textOf(i, 'Amount'); if (t) t.fills = [paint('text/positive')]; }
  if (r.avatar === false) set(i, { 'Avatar?': false });
  else await avatar(sub(i, 'Avatar'), r.avatar);
  if (k === 'select') set(sub(i, 'Selection'), { Type: r.select === 'radio' ? 'Radio' : 'Checkbox', State: r.locked ? 'Locked' : r.selected ? 'On' : 'Off' }, 'Selection');
  if (k === 'toggle') set(sub(i, 'Toggle'), { State: r.toggle ? 'On' : 'Off' }, 'Toggle');
  if (r.badge) set(sub(i, 'Badge'), { Type: r.badge.type || 'Neutral', Label: r.badge.label }, 'Badge');
  if (r.button) { const b = i.findOne(n => n.type === 'INSTANCE' && /^button$/i.test(n.name)); if (b) { set(b, { 'Label?': r.button }); if (!pkey(b, 'Label')) await setText(b, null, r.button); } }
  role(sp, 'row:' + r.title, i);
}
const cellSupportsToggle = async () => { const c = await comp('Cell'); if (!c) return false; const d = c.type === 'COMPONENT_SET' ? c.componentPropertyDefinitions : {}; return Object.keys(d).some(k => k.split('#')[0] === 'Toggle'); };

// ---------- shared blocks ----------
async function suggestRow(list, theme, sp) {
  const w = box('HORIZONTAL', 'Suggestions', 8);
  for (const s of list) { const i = await make('Suggest', { Label: s, Theme: theme }); add(w, i, false); role(sp, 'suggest:' + s, i); }
  return w;
}
async function generic(b) {
  const i = await make(b.component, b.props);
  if (!i) return null;
  for (const [n, p] of Object.entries(b.nested || {})) { const s = sub(i, n); if (s) set(s, p, n); else warn(b.component + ': no nested "' + n + '"'); }
  for (const [layer, v] of Object.entries(b.texts || {})) await setText(i, layer, v);
  if (b.icon) swap(i, 'Icon', await iconNode(b.icon));
  return i;
}
// @base-begin
// ---------- base UI blocks ----------
async function heroAmount(b) {
  const h = await make('Block / Hero amount', { Label: b.label || '', Amount: b.amount, 'Show caption': !!b.caption, Caption: b.caption || '', 'Badge?': !!b.badge });
  if (h && b.badge) set(sub(h, 'Badge'), { Type: b.badge.type || 'Neutral', Label: b.badge.label }, 'Badge');
  if (h && b.amount && /^\+/.test(b.amount)) { const t = textOf(h, 'Amount'); if (t) t.fills = [paint('text/positive')]; }
  return h;
}
async function heroCard(b) {
  const w = box('HORIZONTAL', 'Hero card'); w.primaryAxisAlignItems = 'CENTER';
  const c = await make('Card', { Size: b.size || 'L', Layout: b.layout || 'E', Network: b.network || 'Visa', 'Frozen?': !!b.frozen, 'Virtual?': !!b.virtual, 'Show details?': false, 'Last 4': b.last4, 'Short number?': '•••• ' + b.last4 });
  if (c && b.design) set(sub(c, 'Art'), { Design: b.design }, 'Card art');
  add(w, c, false);
  return w;
}
async function heroPerson(b) {
  const h = box('VERTICAL', 'Hero person', 16);
  const av = await make('Avatar'); await avatar(av, b.avatar || { person: b.name });
  if (av) { set(av, { 'Sublogo?': false }); av.rescale((b.size || 96) / av.width); add(h, av, false); }
  const t = box('VERTICAL', 'Name', 8); add(h, t);
  wrapText(add(t, await txt(b.name, 'Title/Display 3', 'text/primary')));
  if (b.caption) wrapText(add(t, await txt(b.caption, 'Label/Hero', 'text/secondary')));
  return h;
}
async function statement(b) {
  const [a, g] = b.statement; const s = a + (g ? ' ' + g : '');
  const t = await txt(s, b.style || 'Title/Title 1', 'text/primary', g ? [[a.length + 1, s.length, 'text/secondary']] : []);
  t.name = 'Statement'; return t;
}
async function actions(b, sp) {
  const list = b.actions.map(a => typeof a === 'string' ? { label: a } : a);
  const single = list.length === 1;
  const r = await make('Block / Action row', { Layout: single ? 'Single' : 'Pair', 'More?': b.more !== false });
  if (!r) return null;
  const names = single ? ['Main action'] : ['Action 1', 'Action 2'];
  for (let k = 0; k < names.length; k++) {
    const btn = sub(r, names[k]), a = list[k]; if (!btn || !a) { if (a) warn('Action row: no "' + names[k] + '"'); continue; }
    set(btn, { Label: a.label, 'Icon Left?': !!a.icon });
    if (a.icon) swap(btn, 'Icon Left', await iconNode(a.icon));
    role(sp, 'action:' + a.label, btn);
  }
  if (single) role(sp, 'cta', sub(r, 'Main action'));
  return r;
}
async function group(b, sp) {
  const rows = b.rows || [];
  const needWrap = rows.some(r => rowKind(r) === 'toggle') && !(await cellSupportsToggle());
  if (rows.length <= 5 && !needWrap && !b.manual) {
    const g = await make('Block / List group', { 'Row 3': rows.length >= 3, 'Row 4': rows.length >= 4, 'Row 5': rows.length >= 5, 'Header?': !!b.group });
    if (!g) return null;
    const h = sub(g, 'Header');
    if (h) { if (b.group) set(h, { Title: b.group, Aside: !!b.aside, 'Aside text': b.aside || '' }, 'Section header'); else h.visible = false; }
    for (let k = 0; k < rows.length; k++) await row(sub(g, 'Row ' + (k + 1)), rows[k], sp);
    for (let k = rows.length; k < 2; k++) { const r = sub(g, 'Row ' + (k + 1)); if (r) r.visible = false; }  // Row 1–2 have no boolean
    g.name = 'Group · ' + (b.group || 'untitled');
    return g;
  }
  const g = box('VERTICAL', 'Group · ' + (b.group || 'untitled'), 12);
  if (b.group) add(g, await make('Section header', { Title: b.group, Aside: !!b.aside, 'Aside text': b.aside || '' }));
  const list = box('VERTICAL', 'Rows', b.gap || 20); add(g, list);
  for (const r of rows) {
    const c = await make('Cell');
    if (rowKind(r) === 'toggle' && needWrap) {
      const line = box('HORIZONTAL', 'Toggle row', 12); line.counterAxisAlignItems = 'CENTER'; add(list, line);
      add(line, c); await row(c, Object.assign({}, r, { kind: 'action', chevron: false }), sp);
      add(line, await make('Toggle', { State: r.toggle ? 'On' : 'Off' }), false);
    } else { add(list, c); await row(c, r, sp); }
  }
  return g;
}
async function chips(b) {
  const w = box('HORIZONTAL', 'Chips', 8);
  for (const c of b.chips) { const o = typeof c === 'string' ? { label: c } : c; add(w, await make('Chip', { Type: o.selected ? 'Selected' : 'Default', Label: o.label }), false); }
  return w;
}
async function block(b, sp) {
  if (b.hero === 'amount') return heroAmount(b);
  if (b.hero === 'card') return heroCard(b);
  if (b.hero === 'person') return heroPerson(b);
  if (b.statement) return statement(b);
  if (b.actions) return actions(b, sp);
  if (b.rows) return group(b, sp);
  if (b.chips) return chips(b);
  if (b.segmented) {
    const s = await make('Segmented control');
    if (s) { for (let k = 3; k <= 6; k++) set(s, { ['Item ' + k + '?']: b.segmented.length >= k });
      const ts = s.findAllWithCriteria({ types: ['TEXT'] }).filter(t => t.visible);
      for (let k = 0; k < b.segmented.length && k < ts.length; k++) { await fonts(ts[k]); ts[k].characters = b.segmented[k]; } }
    return s;
  }
  if (b.search !== undefined) return make('Search field', { State: 'Default', Text: b.search });
  if (b.progress) { const p = b.progress; return make('Progress', { Value: [0, 25, 50, 75, 100].reduce((a, v) => Math.abs(v - p.value) < Math.abs(a - p.value) ? v : a, 0), Label: p.label || '', 'Value text': p.valueText || '', 'Labels?': !!(p.label || p.valueText) }); }
  if (b.empty) {
    const e = await make('Empty state', { Title: b.empty.title, Text: b.empty.text || '', 'Action?': !!b.empty.action });
    if (e && b.empty.icon) swap(e, 'Icon', await iconNode(b.empty.icon));
    if (e && b.empty.action) { const btn = e.findOne(n => n.type === 'INSTANCE' && pkey(n, 'Label')); if (btn) set(btn, { Label: b.empty.action }); }
    return e;
  }
  if (b.fields) { const w = box('VERTICAL', 'Fields', 16); for (const f of b.fields) add(w, await make('Text Field', { Label: f.label, Placeholder: f.placeholder || '', 'Caption?': f.caption || '', 'Description?': !!f.caption, State: f.state || 'Default' })); return w; }
  if (b.fromTo) {
    const w = box('VERTICAL', 'From → to', 8);
    const a = add(w, await make('Cell')); await row(a, Object.assign({ kind: 'state' }, b.fromTo.from), sp);
    const ic = await iconNode('Icon / arrow-down');
    if (ic) { const ar = box('HORIZONTAL', 'Arrow'); num(ar, 'paddingLeft', 12); add(w, ar); add(ar, ic.createInstance(), false); }
    const c = add(w, await make('Cell')); await row(c, Object.assign({ kind: 'state' }, b.fromTo.to), sp);
    return w;
  }
  if (b.text) { const t = await txt(b.text, b.style || 'Body/Regular', b.color || 'text/secondary'); return t; }
  if (b.component) return generic(b);
  warn(sp.id + ': unknown block ' + JSON.stringify(b).slice(0, 60));
  return null;
}
// spacing pair rule (foundations/layout.md §3): previous kind → next kind
const kindOf = b => b.hero ? 'hero' : b.actions ? 'actions' : b.rows ? 'group' : b.statement ? 'statement' : b.segmented ? 'segmented' : b.search !== undefined ? 'search' : b.chips ? 'chips' : b.empty ? 'empty' : 'other';
function gapBase(p, n, b) {
  if (b && b.gapBefore) return b.gapBefore;
  if (!p) return n === 'hero' || n === 'statement' ? 48 : 24;
  if (p === 'hero' && n === 'actions') return 24;
  if (n === 'group') return ['segmented', 'search', 'chips'].includes(p) ? 24 : 48;
  if (p === 'group') return 48;
  return 24;
}

// ---------- screens ----------
function setModes(f, sp) {
  const m = (col, name) => {
    const c = COLS[col]; if (!c) return warn('no collection ' + col);
    const md = c.modes.find(x => x.name === name); if (!md) return warn(col + ': no mode ' + name);
    f.setExplicitVariableModeForCollection(c, md.modeId);
  };
  m('Color', sp.archetype === 'chat' || sp.mode === 'dark' ? 'dark' : 'light');
  if (sp.theme || OPTS.theme) m('Theme', sp.theme || OPTS.theme);
  if (sp.persona) m('Spirit persona', sp.persona);
}
function frame(sp) {
  const f = figma.createFrame(); f.name = sp.name || sp.id;
  f.resize(402, 874); f.layoutMode = 'VERTICAL'; f.counterAxisSizingMode = 'FIXED'; f.primaryAxisSizingMode = 'AUTO';
  f.clipsContent = true; f.fills = [paint('background/primary')]; f.itemSpacing = 0;
  setModes(f, sp); return f;
}
function absolute(f, n, x, y) { f.appendChild(n); n.layoutPositioning = 'ABSOLUTE'; n.x = x; n.y = y; return n; }
async function topBar(f, tb, sp) {
  if (!tb) return;
  const t = await make('TopBar', { Back: tb.back !== false, 'Right action': !!tb.right, Avatar: !!tb.avatar, 'Close?': tb.close ? true : undefined });
  if (!t) return;
  add(f, t);
  const title = sub(t, 'Title');
  if (title) { if (tb.title) set(title, { Title: tb.title, 'Subtitle?': !!tb.subtitle, 'Subtitle text?': tb.subtitle || '' }, 'TopBar Title'); else title.visible = false; }
  if (tb.right) { const r = t.findOne(n => n.type === 'INSTANCE' && /right/i.test(n.name)); if (r) swap(r, 'Icon', await iconNode(tb.right)); }
  role(sp, 'back', t.findOne(n => n.type === 'INSTANCE' && /back/i.test(n.name)) || t);
}
async function baseScreen(sp) {
  const f = frame(sp);
  add(f, await make('StatusBar', { 'Time?': '9:41' }));
  await topBar(f, sp.topbar, sp);
  const c = box('VERTICAL', 'Content'); add(f, c); pad(c, 0, 16, 0);
  let prev = null;
  for (const b of sp.body || []) {
    const n = kindOf(b); const g = gapBase(prev, n, b);
    if (g) add(c, spacer(g));
    const node = await block(b, sp); if (node) { add(c, node, b.hero === 'person' || b.text ? true : !b.hug); if (node.type === 'TEXT') wrapText(node); }
    prev = n;
  }
  const bottom = sp.bottom || {};
  let chat = null;
  if (bottom.cta) {
    const w = box('VERTICAL', 'Bottom CTA', 8); add(f, w); pad(w, 24, 16, 8);
    const p = await make('Button', { Type: 'Primary', Size: 'l', Label: bottom.cta }); add(w, p); role(sp, 'cta', p);
    if (bottom.ghost) { const g = await make('Button', { Type: 'Ghost', Size: 'l', Label: bottom.ghost }); add(w, g); role(sp, 'ghost', g); }
  }
  if (bottom.keyboard) add(f, await make('Keyboard'));
  if (bottom.chat) {
    chat = await make('Block / Bottom chat', { 'Suggestions?': bottom.chat.length > 0, 'Suggestion 2?': bottom.chat.length >= 2, 'Suggestion 3?': bottom.chat.length >= 3 });
    if (chat) for (let k = 0; k < bottom.chat.length; k++) { const s = sub(chat, 'Suggestion ' + (k + 1)); set(s, { Label: bottom.chat[k] }, 'Suggestion'); role(sp, 'suggest:' + bottom.chat[k], s); }
    if (chat && bottom.undo) warn('undo chip: put "Undo" as the first suggestion');
    add(c, spacer(chat ? Math.max(24, Math.round(chat.height)) : 176, 'space bottom chat'));
  } else if (!bottom.cta && !bottom.keyboard) add(c, spacer(48));
  const hasHI = chat && chat.findOne(n => /home ?indicator/i.test(n.name));
  if (bottom.cta) add(f, await make('HomeIndicator'));
  if (bottom.cta || bottom.keyboard) { if (f.height < 874) { f.primaryAxisSizingMode = 'FIXED'; f.resize(402, 874); c.layoutSizingVertical = 'FILL'; } }
  else if (f.height < 874) { f.primaryAxisSizingMode = 'FIXED'; f.resize(402, 874); }
  // a modal state is what the device shows: one 874 viewport, the alert centred in it
  if (sp.overlay && f.height > 874) { f.primaryAxisSizingMode = 'FIXED'; f.resize(402, 874); }
  if (chat) { absolute(f, chat, 0, f.height - chat.height); chat.resize(402, chat.height); chat.constraints = { horizontal: 'STRETCH', vertical: 'MAX' }; }
  if (!bottom.cta && !bottom.keyboard && !hasHI) { const hi = await make('HomeIndicator'); if (hi) { absolute(f, hi, 0, f.height - hi.height); hi.constraints = { horizontal: 'STRETCH', vertical: 'MAX' }; } }
  if (sp.overlay) await overlay(f, sp.overlay, sp);
  return f;
}
async function overlay(f, o, sp) {
  const dim = figma.createRectangle(); dim.name = 'Overlay'; dim.resize(402, f.height); dim.fills = [paint('background/overlay')];
  absolute(f, dim, 0, 0); dim.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
  if (o.sheet) {
    const s = o.sheet, n = s.options.length;
    const sh = await make('Block / Option sheet', { 'Option 3': n >= 3, 'Option 4': n >= 4 });
    if (!sh) return;
    set(sub(sh, 'SheetBar'), { Type: 'Title', Title: s.title }, 'SheetBar');
    for (let k = 0; k < n; k++) await row(sub(sh, 'Option ' + (k + 1)), Object.assign({ select: 'radio' }, s.options[k]), sp);
    const a = sub(sh, 'Action'); set(a, { Label: s.action }, 'Sheet action'); role(sp, 'cta', a);
    absolute(f, sh, 0, f.height - sh.height); sh.resize(402, sh.height); sh.constraints = { horizontal: 'STRETCH', vertical: 'MAX' };
  }
  if (o.alert) {
    const a = o.alert;
    const al = await make('Alert', { Type: a.destructive ? 'Destructive' : 'Default', Title: a.title, Message: a.message });
    if (!al) return;
    set(sub(al, 'Action'), { Label: a.action }, 'Alert action'); set(sub(al, 'Cancel'), { Label: a.cancel || 'Cancel' }, 'Alert cancel');
    role(sp, 'cta', sub(al, 'Action')); role(sp, 'cancel', sub(al, 'Cancel'));
    absolute(f, al, 40, 0); al.resize(322, al.height); al.y = Math.round((Math.min(f.height, 874) - al.height) / 2);
  }
}

// @base-end
// @chat-begin
// ---------- chat ----------
const CHAT_GAP = (p, n) => {
  if (p === 'ask') return 28;
  if (p === 'lead') return n === 'number' ? 8 : ['body', 'meta', 'list'].includes(n) ? 20 : 28;
  if (n === 'h3') return 28;
  if (p === 'h3') return 8;
  if (['numberRow', 'table'].includes(p) && n === 'meta') return 28;
  if (['number', 'numberRow', 'rows', 'table', 'check', 'list'].includes(p) && ['body', 'meta'].includes(n)) return 20;
  if (p === 'body' && ['body', 'list'].includes(n)) return 12;
  return 28;
};
async function chatPart(p, sp) {
  const k = Object.keys(p)[0], v = p[k];
  if (k === 'lead') {
    const [a, g] = v; const i = await make('Answer / Lead');
    const val = s => typeof s === 'string' && s.startsWith('$') && VARS[s.slice(1)] ? figma.variables.createVariableAlias(VARS[s.slice(1)]) : s;
    set(i, { Answer: val(a), Continuation: val(g || ''), 'Show continuation': !!g }, 'Answer / Lead'); return i;
  }
  if (k === 'body') {
    const i = await make('Answer / Body'); if (!i) return null;
    const marks = []; let plain = '', last = 0, m; const re = /\*\*([^*]+)\*\*/g;
    while ((m = re.exec(v))) { plain += v.slice(last, m.index); marks.push([plain.length, plain.length + m[1].length]); plain += m[1]; last = m.index + m[0].length; }
    plain += v.slice(last);
    if (pkey(i, 'Text')) set(i, { Text: plain }); else { const t = await setText(i, null, plain); if (t && marks.length && TS['Chat/Body strong']) for (const [a, b] of marks) { await t.setRangeTextStyleIdAsync(a, b, TS['Chat/Body strong'].id); t.setRangeFills(a, b, [paint('text/on dark/primary')]); } }
    return i;
  }
  if (k === 'number') { const i = await make('Answer / Number'); if (i) { if (pkey(i, 'Number')) set(i, { Label: v[1] || '', Number: v[0] }); else { await setText(i, 'Number', v[0]); await setText(i, 'Label', v[1] || ''); } } return i; }
  if (k === 'numberRow') {
    const i = await make('Answer / Number row'); if (!i) return null;
    if (pkey(i, 'Value 1')) { const pr = { 'Item 3?': v.length >= 3 }; v.forEach((x, j) => { pr['Value ' + (j + 1)] = x[0]; pr['Label ' + (j + 1)] = x[1]; }); set(i, pr); return i; }
    const kids = i.children, start = v.length === 2 && kids.length > 2 ? 1 : 0;
    if (kids.length > 2) kids[0].visible = v.length !== 2;
    for (let j = 0; j < v.length; j++) { const it = kids[start + j]; if (!it) break; it.visible = true; const tx = it.findAllWithCriteria({ types: ['TEXT'] }); const tv = tx.find(n => n.name === 'Value') || tx[0], tl = tx.find(n => n.name === 'Label') || tx[1]; if (tv) { await fonts(tv); tv.characters = v[j][0]; } if (tl) { await fonts(tl); tl.characters = v[j][1]; } }
    return i;
  }
  if (k === 'h3') { const i = await make('Answer / H3'); if (i) { if (pkey(i, 'Text')) set(i, { Text: v }); else await setText(i, null, v); } return i; }
  if (k === 'meta') { const i = await make('Answer / Meta'); if (i) { if (pkey(i, 'Text')) set(i, { Text: v }); else await setText(i, null, v); } return i; }
  if (k === 'list') { const w = box('VERTICAL', 'List', 8); for (const s of v) { const i = await make('Answer / List item'); if (i) { if (pkey(i, 'Text')) set(i, { Text: s }); else await setText(i, null, s); add(w, i); } } return w; }
  if (k === 'rows') { const w = box('VERTICAL', 'Rows', 16); for (const r of v) { const c = add(w, await make('Cell')); await row(c, Object.assign({ chevron: false }, r), sp); } return w; }
  if (k === 'check') {
    const i = await make('Answer / Check', { Label: v.label, Amount: v.amount, Caption: v.caption }); if (!i) return null;
    await row(sub(i, 'From'), Object.assign({ kind: 'state' }, v.from), sp); await row(sub(i, 'To'), Object.assign({ kind: 'state' }, v.to), sp);
    return i;
  }
  if (k === 'faceId') return make('Answer / Face ID');
  if (k === 'component') return generic(p);
  warn(sp.id + ': unknown answer part ' + k); return null;
}
async function chatScreen(sp) {
  const f = frame(sp); f.primaryAxisSizingMode = 'FIXED'; f.resize(402, 874);
  const bg = await make('Spirit / Chat background'); if (bg) { absolute(f, bg, 0, 0); bg.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' }; }
  add(f, await make('StatusBar', { 'Time?': '9:41' }));
  const tb = await make('Chat / Top bar'); add(f, tb);
  if (tb) { const t = sub(tb, 'Title') || tb; set(t, { Title: sp.topic || '', 'Subtitle?': false }, 'Chat / Top bar'); }
  const msgs = box('VERTICAL', 'Messages'); add(f, msgs); msgs.layoutSizingVertical = 'FILL'; msgs.primaryAxisAlignItems = 'MAX'; msgs.counterAxisAlignItems = 'MAX'; pad(msgs, 16, 16, 16);
  if (sp.ask) {
    const um = await make('Chat / User message');
    if (um) { if (pkey(um, 'Text')) set(um, { Text: sp.ask }); else if (pkey(um, 'Message')) set(um, { Message: sp.ask }); else await setText(um, null, sp.ask); add(msgs, um, false); }
  }
  let prev = sp.ask ? 'ask' : null;
  for (const p of sp.answer || []) {
    const k = Object.keys(p)[0];
    if (prev) { const s = await make('Answer / Space', { Size: String(CHAT_GAP(prev, k)) }); if (s) add(msgs, s); }
    const n = await chatPart(p, sp); if (n) add(msgs, n);
    prev = k;
  }
  if (sp.suggest && sp.suggest.length) { const r = await suggestRow(sp.suggest, 'Dark', sp); add(f, r); pad(r, 8, 16, 8); }
  add(f, await make('BottomBar', { 'Suggestions?': false }));
  add(f, await make('HomeIndicator'));
  return f;
}

// @chat-end
// ---------- canvas ----------
async function section(name) {
  const page = figma.currentPage;
  let s = page.children.find(n => n.type === 'SECTION' && n.name === name);
  if (s) return s;
  s = figma.createSection(); s.name = name;
  let maxY = 0; for (const n of page.children) if (n !== s) maxY = Math.max(maxY, n.y + n.height);
  s.x = 0; s.y = maxY + 400; return s;
}
async function link(sp, frames) {
  for (const l of sp.links || []) {
    const from = (ROLES[sp.id] || {})[l.from]; const to = frames[l.to];
    if (!from) { warn(sp.id + ': link from "' + l.from + '" — no such element'); continue; }
    const action = l.to === 'back' ? { type: 'BACK' } : to ? { type: 'NODE', destinationId: to.id, navigation: 'NAVIGATE', transition: { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.25 }, resetVideoPosition: false } : null;
    if (!action) { warn(sp.id + ': link to "' + l.to + '" — no such screen in this call'); continue; }
    try { await from.setReactionsAsync([{ trigger: { type: 'ON_CLICK' }, actions: [action] }]); } catch (e) { warn(sp.id + ': link ' + l.from + ' failed: ' + String(e.message).slice(0, 60)); }
  }
}
async function main() {
  const page = await byId(OPTS.pageId); await figma.setCurrentPageAsync(page);
  await loadLibrary();
  const sec = await section(OPTS.section);
  const existing = sec.children.filter(n => n.type === 'FRAME');
  let col = existing.length ? Math.max(...existing.map(n => Math.round((n.x - 120) / 522))) + 1 : 0;
  const frames = {}, out = [];
  for (const sp of SPECS) {
    const before = LOG.length;
    let f;
    try { f = sp.archetype === 'chat' ? await chatScreen(sp) : await baseScreen(sp); }
    catch (e) { warn(sp.id + ': build failed — ' + String(e.message).slice(0, 120)); continue; }
    const old = OPTS.replace ? existing.find(n => !n.removed && n.name === f.name) : null;
    sec.appendChild(f);
    if (old) { f.x = old.x; f.y = old.y; const oc = sec.children.find(n => n.type === 'TEXT' && n.name === 'caption · ' + old.name); old.remove(); if (oc) oc.remove(); existing.splice(existing.indexOf(old), 1); }
    else { f.x = 120 + col * 522; f.y = 200; col++; }
    const cap = await txt(sp.caption || sp.name || sp.id, 'Body/Regular', 'text/secondary'); cap.name = 'caption · ' + f.name;
    sec.appendChild(cap); cap.resize(402, cap.height); cap.textAutoResize = 'HEIGHT'; cap.x = f.x; cap.y = f.y - cap.height - 24;
    frames[sp.id] = f;
    out.push({ id: sp.id, frame: f.id, name: f.name, height: Math.round(f.height), warnings: LOG.length - before });
  }
  for (const sp of SPECS) await link(sp, frames);
  let w = 0, h = 0; for (const n of sec.children) { w = Math.max(w, n.x + n.width); h = Math.max(h, n.y + n.height); }
  sec.resizeWithoutConstraints(w + 120, h + 120);
  if (OPTS.shots) for (const sp of SPECS) if (frames[sp.id]) await frames[sp.id].screenshot({ scale: OPTS.shotScale || 0.5 });
  return { section: sec.id, screens: out, log: LOG };
}
return await main();
