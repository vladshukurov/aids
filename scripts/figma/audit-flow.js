// Cross-screen audit of a flow. Paste into one use_figma call with FRAME_IDS in flow order.
// Checks: one photo per name, one name per photo, dead ends and broken prototype links.
// Returns the money and names on every screen so a reviewer can recompute before → after.
const FRAME_IDS = ['REPLACE_ME'];
figma.skipInvisibleInstanceChildren = false;
const first = await figma.getNodeByIdAsync(FRAME_IDS[0]);
let page = first; while (page && page.type !== 'PAGE') page = page.parent;
await figma.setCurrentPageAsync(page);
const E = [], W = [], screens = [];
const photoOf = {}, nameOf = {};
const prop = (i, p) => { const k = Object.keys(i.componentProperties || {}).find(x => x.split('#')[0] === p); return k ? i.componentProperties[k].value : undefined; };
const ids = new Set(FRAME_IDS);
for (const [n, id] of FRAME_IDS.entries()) {
  const f = await figma.getNodeByIdAsync(id); if (!f) { E.push(`frame ${id} not found`); continue; }
  const money = [], people = [];
  for (const t of f.findAllWithCriteria({ types: ['TEXT'] })) {
    if (!t.visible) continue;
    const m = t.characters.match(/[−+-]?\s?[€$£]\s?[\d,]+(\.\d{2})?/g); if (m) money.push(...m.map(x => x.replace(/\s/g, '')));
  }
  for (const c of f.findAllWithCriteria({ types: ['INSTANCE'] })) {
    const nm = prop(c, 'Cell Name'); if (!nm || !c.visible) continue;
    const av = c.findOne(x => x.type === 'INSTANCE' && /avatar/i.test(x.name));
    const img = av && av.findOne(x => 'fills' in x && Array.isArray(x.fills) && x.fills.some(p => p.type === 'IMAGE'));
    if (!img) continue;
    const hash = img.fills.find(p => p.type === 'IMAGE').imageHash;
    people.push(nm);
    if (photoOf[nm] && photoOf[nm] !== hash) E.push(`"${nm}" has two different photos (screen ${n + 1})`);
    if (nameOf[hash] && nameOf[hash] !== nm) E.push(`one photo used for "${nameOf[hash]}" and "${nm}"`);
    photoOf[nm] = hash; nameOf[hash] = nm;
  }
  const taps = f.findAll(x => 'reactions' in x && x.reactions && x.reactions.length);
  const targets = [];
  for (const x of taps) for (const r of x.reactions) for (const a of r.actions || []) {
    if (a.type === 'NODE') { targets.push(a.destinationId); if (!ids.has(a.destinationId)) W.push(`"${f.name}" links to ${a.destinationId}, outside this flow`); }
    if (a.type === 'BACK') targets.push('back');
  }
  if (!targets.length && n < FRAME_IDS.length - 1) W.push(`"${f.name}" has no prototype link — dead end?`);
  screens.push({ id, name: f.name, money: [...new Set(money)], people: [...new Set(people)], links: targets });
}
return { errors: E, warnings: W, screens };
