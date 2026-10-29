// Shared helpers for screen specs: load, read persona data, lint against the product rules.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const readJSON = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

// A spec file holds one screen, an array of screens, or { flow, screens: [...] }.
export function loadSpecs(files) {
  const out = [];
  for (const f of files) {
    const data = JSON.parse(readFileSync(f, 'utf8'));
    const list = Array.isArray(data) ? data : data.screens ? data.screens : [data];
    for (const s of list) out.push(Object.assign({ file: f, flow: data.flow }, s));
  }
  return out;
}

// People, accounts and cards from foundations/persona.md (the single source of data).
export function persona() {
  const md = readFileSync(join(ROOT, 'foundations/persona.md'), 'utf8');
  const table = head => {
    const m = md.split(/^## /m).find(s => s.startsWith(head));
    if (!m) return [];
    return m.split('\n').filter(l => /^\|/.test(l) && !/^\|\s*-/.test(l)).slice(1)
      .map(l => l.split('|').slice(1, -1).map(c => c.trim()));
  };
  const people = {};
  const me = (md.match(/\*\*([^*]+)\*\*, lives/) || [])[1] || 'Alex Morgan';
  people[me] = { onReverse: true, photo: true, me: true };
  for (const [name, on, , photo] of table('People')) people[name] = { onReverse: /^yes/i.test(on), photo: /Image/.test(photo || '') };
  const accounts = table('Accounts').map(r => r[0]);
  const cards = table('Cards').map(r => r[1]);
  return { me, people, accounts, cards };
}

const words = s => String(s).trim().split(/\s+/).filter(Boolean).length;
const rowKind = r => r.kind || (r.toggle !== undefined ? 'toggle' : r.select ? 'select' : r.amount ? 'money' : r.button ? 'copy' : r.chevron === false ? 'state' : 'action');
const ARCH = ['object', 'list', 'picker', 'sheet', 'amount', 'confirm', 'home', 'chat'];
const ROW_KINDS = ['money', 'action', 'state', 'person', 'toggle', 'select', 'copy', 'info'];
const BLOCK_KEYS = ['hero', 'statement', 'actions', 'rows', 'chips', 'segmented', 'search', 'progress', 'empty', 'fields', 'fromTo', 'text', 'component'];
const CHAT_PARTS = ['lead', 'body', 'number', 'numberRow', 'h3', 'meta', 'list', 'rows', 'check', 'faceId', 'component'];
const GUI_PARTS = ['rows', 'check', 'numberRow', 'table'];
const WEAK_CAPTION = /^(details|info|more|settings|options|manage|tap to .*|see more|requested · just now)$/i;

// Returns { errors, warnings } for one screen spec. ctx = { persona, icons:Set|null }.
export function lintSpec(sp, ctx) {
  const E = [], W = [];
  const at = sp.id || sp.name || '?';
  const err = m => E.push(`${at}: ${m}`), wrn = m => W.push(`${at}: ${m}`);
  const chat = sp.archetype === 'chat';
  if (!sp.id) err('needs an "id" (used for links and file names)');
  if (!ARCH.includes(sp.archetype)) err(`archetype must be one of ${ARCH.join(', ')}`);
  if (!sp.caption) wrn('no "caption": one line above the screen saying what happens and why');

  const texts = [];
  const pushText = (where, s) => { if (typeof s === 'string') texts.push([where, s]); };
  const icon = n => { if (n && ctx.icons && ctx.icons.size && !ctx.icons.has(n) && !ctx.icons.has('SF / ' + n) && !ctx.icons.has('Icon / ' + n)) err(`icon "${n}" not in the library (components/icons.md)`); };
  const person = n => { if (n && !ctx.persona.people[n]) err(`person "${n}" is not in foundations/persona.md`); };
  const amount = (where, a) => {
    if (!a) return;
    if (/^-/.test(a.trim())) err(`${where}: "${a}" uses a hyphen; outgoing money is "−" (U+2212)`);
    if (/^\+/.test(a.trim()) && /(sent|paid to|you owe|fee|withdraw)/i.test(where)) wrn(`${where}: "+" (green) is only for money coming in`);
  };
  let primaries = 0;

  const checkRow = (r, where, inChat) => {
    const k = rowKind(r);
    if (!ROW_KINDS.includes(k)) err(`${where}: unknown row kind "${k}"`);
    if (!r.title) err(`${where}: row without a title`);
    pushText(where + ' title', r.title); pushText(where + ' caption', r.caption); pushText(where + ' amount', r.amount);
    if (r.amount && r.chevron) err(`${where} "${r.title}": a row with an amount has no chevron`);
    if (r.caption && WEAK_CAPTION.test(r.caption.trim())) wrn(`${where} "${r.title}": caption "${r.caption}" says nothing — state a fact or a consequence`);
    // mono captions are wide: past these lengths they wrap to a second line (measured on 402 frames)
    const room = { toggle: 28, select: 28, money: 26, copy: 24, person: 26 }[k] || 32;
    if (r.caption && r.caption.length > room) wrn(`${where} "${r.title}": caption is ${r.caption.length} chars and wraps (max ~${room} for a ${k} row) — shorten it`);
    if (!r.caption && ['state', 'action'].includes(k) && !inChat) wrn(`${where} "${r.title}": no caption — the current value or the consequence makes the row informative`);
    if (k === 'state' && r.chevron) err(`${where} "${r.title}": state rows have no chevron`);
    if (r.select && r.selectSide === 'left') err(`${where}: checkboxes and radios sit on the right`);
    amount(`${where} "${r.title}"`, r.amount);
    if (r.avatar) { person(r.avatar.person); icon(r.avatar.icon); }
    if (r.badge && r.badge.type === 'Success' && !/paid|received|in\b/i.test(r.badge.label)) wrn(`${where}: Success badge is for money received`);
  };

  if (chat) {
    if (sp.mode === 'light') err('chat screens are dark');
    if (!sp.topic) wrn('chat: no "topic" for the top bar (mono caps, 1–2 words)');
    const parts = (sp.answer || []).map(p => Object.keys(p)[0]);
    parts.forEach(p => { if (!CHAT_PARTS.includes(p)) err(`chat: unknown answer part "${p}"`); });
    if (parts.length && !['lead', 'body'].includes(parts[0])) wrn('chat: an answer starts with a Lead or plain Body text');
    if (parts.filter(p => p === 'lead').length > 1) err('chat: one Lead per answer');
    if (parts.filter(p => p === 'number').length > 1) err('chat: one hero Number per answer');
    if (parts.filter(p => GUI_PARTS.includes(p)).length > 1) err('chat: at most one GUI piece (rows, check, number row, table) per answer');
    for (const p of sp.answer || []) {
      const [k, v] = Object.entries(p)[0];
      if (k === 'lead') { (v || []).forEach((s, j) => { pushText('lead', s); if (typeof s === 'string' && !s.startsWith('$') && s.length > 32) wrn(`lead part ${j + 1} is ${s.length} chars; keep each part ≤ 28`); }); }
      if (k === 'body' || k === 'meta' || k === 'h3') pushText(k, v);
      if (k === 'list') v.forEach(s => pushText('list', s));
      if (k === 'rows') v.forEach((r, j) => checkRow(r, `answer row ${j + 1}`, true));
      if (k === 'number') { pushText('number', v[0]); amount('number', v[0]); }
      if (k === 'check') {
        amount('check', v.amount); checkRow(Object.assign({ kind: 'state' }, v.from), 'check from', true); checkRow(Object.assign({ kind: 'state' }, v.to), 'check to', true);
        const s = sp.suggest || [];
        if (s.length !== 3 || !/^cancel$/i.test(s[2] || '')) err('chat: a money Check has exactly three suggestions: "<Action> <amount>" / "Other amount" / "Cancel"');
      }
    }
    for (const s of sp.suggest || []) { pushText('suggestion', s); if (words(s) > 6) wrn(`suggestion "${s}" is over 6 words`); }
    if ((sp.suggest || []).length > 4) err('chat: max 4 suggestions (usually 1–2)');
  } else {
    if (sp.topbar && sp.topbar.title) {
      const t = sp.topbar.title; pushText('top bar', t);
      if (t !== t.toUpperCase()) wrn(`top bar title "${t}" is mono caps: write it in capitals`);
      if (words(t.replace(/•+\s*\d{4}/, 'X')) > 3) wrn(`top bar title "${t}" — 1–2 words`);
    }
    if (!sp.topbar && !['home', 'sheet'].includes(sp.archetype)) wrn('no top bar: base screens have navigation (Back or close)');
    const kinds = [];
    for (const [j, b] of (sp.body || []).entries()) {
      const k = BLOCK_KEYS.find(x => x in b);
      if (!k) { err(`body[${j}]: unknown block ${JSON.stringify(b).slice(0, 60)}`); continue; }
      kinds.push(k === 'hero' ? 'hero:' + b.hero : k);
      if (k === 'hero') {
        if (!['amount', 'card', 'person'].includes(b.hero)) err(`hero must be amount, card or person`);
        if (b.hero === 'amount') { pushText('hero', b.amount); pushText('hero label', b.label); amount('hero', b.amount); }
        if (b.hero === 'card') { if (!/^\d{4}$/.test(b.last4 || '')) err('card hero needs "last4": "0020"'); else if (!ctx.persona.cards.includes(b.last4) && !b.newCard) wrn(`card ${b.last4} is not in persona.md (set "newCard": true for a new card)`); }
        if (b.hero === 'person') { pushText('hero name', b.name); person(b.avatar ? b.avatar.person : b.name); }
      }
      if (k === 'statement') { if (!['home'].includes(sp.archetype)) err('two-tone statements live only on home (and in chat)'); b.statement.forEach(s => pushText('statement', s)); }
      if (k === 'actions') {
        const list = b.actions.map(a => typeof a === 'string' ? { label: a } : a);
        if (list.length > 2) err('action row: 1 main action (Primary) or 2 equal ones (Secondary pair) + "···"');
        if (list.length === 1) primaries++;
        list.forEach(a => { pushText('action', a.label); icon(a.icon); if (words(a.label) > 3) wrn(`action "${a.label}" — 1–3 words, verb first`); });
      }
      if (k === 'rows') {
        if (b.rows.length < 2 && !b.allowSingle) err(`group "${b.group || ''}": a section has 2–5 rows; merge a one-row section into another`);
        if (b.rows.length > 5) wrn(`group "${b.group || ''}": ${b.rows.length} rows — over 5 is built without the List group block; consider splitting`);
        if (b.group) { pushText('group title', b.group); if (/^[a-z]/.test(b.group) || (b.group.length > 3 && b.group === b.group.toUpperCase())) wrn(`group title "${b.group}" is sentence case`); }
        b.rows.forEach((r, j) => checkRow(r, `group "${b.group || ''}" row ${j + 1}`));
        if (sp.archetype === 'sheet' && b.rows.some(r => r.chevron)) err('options in a sheet have no chevrons');
      }
      if (k === 'chips') b.chips.forEach(c => pushText('chip', typeof c === 'string' ? c : c.label));
      if (k === 'empty') { pushText('empty', b.empty.title); pushText('empty', b.empty.text); icon(b.empty.icon); }
      if (k === 'text') { pushText('text', b.text); if (!b.style) wrn('free text block: name its style; prefer a row or a caption'); }
      if (k === 'fromTo') { checkRow(Object.assign({ kind: 'state' }, b.fromTo.from), 'from', false); checkRow(Object.assign({ kind: 'state' }, b.fromTo.to), 'to', false); }
    }
    if (sp.archetype === 'object') {
      if (!kinds.some(k => k.startsWith('hero'))) err('object screen needs a hero (amount, card or person)');
      if (kinds.filter(k => k === 'rows').length < 2) wrn('object screen: 2–4 named sections make it feel finished (layout.md §1)');
    }
    const kh = kinds.filter(k => k.startsWith('hero')).length; if (kh > 1) err('one hero per screen');
    const bt = sp.bottom || {};
    if (bt.cta) { primaries++; pushText('cta', bt.cta); }
    if (bt.ghost) pushText('ghost', bt.ghost);
    if (bt.chat) {
      bt.chat.forEach(s => pushText('suggestion', s));
      if (bt.chat.length > 2) err('base screens: max 2 suggestions in the bottom chat');
      if (bt.chat.join('').length > 40) wrn(`bottom chat suggestions are ${bt.chat.join('').length} chars together; they overflow past ~40`);
      if (bt.chat.some(s => /\b(copy|share|open)\b/i.test(s))) err('a suggestion is a question or request to the assistant, never an interface action');
    }
    if (bt.cta && bt.chat) err('bottom: either a CTA or the bottom chat, not both');
    const ov = sp.overlay || {};
    if (ov.sheet) {
      pushText('sheet', ov.sheet.title); pushText('sheet action', ov.sheet.action);
      const n = (ov.sheet.options || []).length; if (n < 2 || n > 4) err('option sheet: 2–4 options');
      ov.sheet.options.forEach((r, j) => checkRow(Object.assign({ select: 'radio' }, r), `sheet option ${j + 1}`, false));
      if (words(ov.sheet.title || '') > 3) wrn('sheet title: 1–3 words, sentence case');
    }
    if (ov.alert) { pushText('alert', ov.alert.title); pushText('alert', ov.alert.message); if (!ov.alert.destructive) wrn('an Alert is for an irreversible action; reversible actions just happen with Undo'); }
    if (primaries > 1) err(`${primaries} Primary buttons; one per light screen`);
    if (ov.sheet && primaries) wrn('the screen behind a sheet is dimmed; its Primary still competes — prefer a Secondary pair there');
  }

  for (const [where, s] of texts) {
    if (/Re:verse|RE:VERSE|Re:Verse/.test(s)) err(`${where}: brand is lowercase "re:verse" (also in caps titles)`);
    if (!chat && /\bSpirit\b/.test(s)) err(`${where}: "Spirit" never appears in base UI`);
    if (/success|successful|congratulations|done!/i.test(s)) err(`${where}: no success messages — land on the object, offer Undo`);
    if (/lorem|placeholder|^(button|label|title|text|suggestion)$/i.test(s.trim())) err(`${where}: placeholder text "${s}"`);
    if (/\*{2,}\s?\d{4}|··\d{4}|\.\.\.\d{4}/.test(s)) err(`${where}: card numbers are "•••• 0020"`);
    if (chat && /[^.]\.$/.test(s.trim()) && !/\d\.$/.test(s.trim())) err(`${where}: no full stop at the end in chat ("${s.slice(-24)}")`);
    if (/\bpocket\b/i.test(s)) err(`${where}: say "Goal", never "pocket"`);
  }
  return { errors: E, warnings: W };
}

export function lintAll(specs, ctx) {
  const E = [], W = [];
  const ids = new Set();
  for (const sp of specs) {
    if (ids.has(sp.id)) E.push(`${sp.id}: duplicate id`); ids.add(sp.id);
    const r = lintSpec(sp, ctx); E.push(...r.errors); W.push(...r.warnings);
  }
  for (const sp of specs) for (const l of sp.links || []) if (l.to !== 'back' && !ids.has(l.to)) W.push(`${sp.id}: link to "${l.to}" — not in this set (build it in the same call to wire the prototype)`);
  // one photo per name: a person shown with an icon/initials somewhere and a photo elsewhere
  return { errors: E, warnings: W };
}

export function libraryIcons() {
  try { const lib = readJSON('state/library.json'); return new Set(Object.keys(lib.icons || {})); } catch { return null; }
}
