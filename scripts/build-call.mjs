#!/usr/bin/env node
// Turn specs into one use_figma script.
//   node scripts/build-call.mjs specs/examples/profile.json [more.json] [--section "Polygon · Profile"] [--replace] [--theme Atlas] [--no-shots]
// Writes .out/call.js (small: specs + a loader). The renderer itself lives in the Figma file (shared plugin data,
// versioned by hash). If the call returns { needsInstall: true }, run .out/install.js once, then the call again.
// --inline writes the old self-contained bundle instead (no install step; ~30k chars).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { ROOT, readJSON, loadSpecs, lintAll, persona, libraryIcons } from './lib/spec.mjs';

const args = process.argv.slice(2);
const flag = n => { const i = args.indexOf(n); return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : undefined; };
const files = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--section', '--theme', '--out', '--scale', '--patch-from'].includes(args[i - 1])));
const inline = !!flag('--inline');
if (!files.length) { console.error('usage: node scripts/build-call.mjs <spec.json> [...] [--section NAME] [--replace] [--theme Atlas] [--no-shots]'); process.exit(2); }

const specs = loadSpecs(files);
const per = persona();
if (!flag('--no-lint')) {
  const { errors, warnings } = lintAll(specs, { persona: per, icons: libraryIcons() });
  for (const w of warnings) console.log('warn   ' + w);
  if (errors.length) { for (const e of errors) console.log('ERROR  ' + e); console.log('Fix the spec (or pass --no-lint to render anyway).'); process.exit(1); }
}

const fig = readJSON('state/figma.json');
const lib = readJSON('state/library.json');
if (!lib.generated) console.log('warn   state/library.json is the hand seed, not a dump: run the sync-library skill before trusting the renderer');

// icons referenced by the specs (keeps the bundle small)
const wanted = new Set(['Icon / arrow-down']);
JSON.stringify(specs, (k, v) => { if ((k === 'icon' || k === 'right') && typeof v === 'string') wanted.add(v); return v; });
const icons = {};
for (const n of wanted) for (const c of [n, 'SF / ' + n, 'Icon / ' + n]) if (lib.icons && lib.icons[c]) icons[c] = lib.icons[c];
// same file: ids are enough; --keys adds library keys for building in another file
const components = {};
for (const [n, c] of Object.entries(lib.components)) if (!n.startsWith('_') || n.startsWith('_Answer')) components[n] = flag('--keys') && c.key ? { id: c.id, key: c.key, set: !!c.set } : c.id;

const people = {};
for (const [n, p] of Object.entries(per.people)) people[n] = { onReverse: p.onReverse, photo: p.photo };
const OPTS = {
  pageId: fig.pages.Polygon,
  section: flag('--section') || `Polygon · ${specs[0].flow || specs[0].id} · ${new Date().toISOString().slice(0, 10)}`,
  replace: !!flag('--replace'),
  theme: typeof flag('--theme') === 'string' ? flag('--theme') : undefined,
  shots: !flag('--no-shots'),
  shotScale: Number(flag('--scale')) || 0.5,
  people,
  photos: fig.photos || {}
};
const strip = src => src.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//')).join('\n');
const clean = specs.map(({ file, ...s }) => s);
const LIBJSON = JSON.stringify({ components, icons: Object.fromEntries(Object.entries(lib.icons || {})) });
let src = readFileSync(join(ROOT, 'scripts/figma/render.js'), 'utf8');
mkdirSync(join(ROOT, '.out'), { recursive: true });
let code;
if (inline) {
  // self-contained: only the renderer parts these specs use, only the icons they reference
  const needChat = specs.some(s => s.archetype === 'chat'), needBase = specs.some(s => s.archetype !== 'chat');
  const part = (s, name, keep) => keep ? s : s.replace(new RegExp(`// @${name}-begin[\\s\\S]*?// @${name}-end`), '');
  const body = strip(part(part(src, 'base', needBase), 'chat', needChat));
  code = `const LIB=${JSON.stringify({ components, icons })};\nconst SPECS=${JSON.stringify(clean)};\nconst OPTS=${JSON.stringify(OPTS)};\n${body}\n`;
} else {
  // installed renderer: the file keeps the renderer + library map; the call carries specs only
  const body = strip(src);
  const hash = createHash('sha1').update(body + LIBJSON).digest('hex').slice(0, 12);
  const install = `const SRC=${JSON.stringify(`const LIB=${LIBJSON};\n${body}`)};\nfigma.root.setSharedPluginData('reverse_ds', 'renderer', SRC);\nfigma.root.setSharedPluginData('reverse_ds', 'renderer_hash', '${hash}');\nreturn { installed: '${hash}', chars: SRC.length };\n`;
  writeFileSync(join(ROOT, '.out', 'install.js'), install);
  writeFileSync(join(ROOT, '.out', `renderer-${hash}.txt`), `const LIB=${LIBJSON};\n${body}`);
  // --patch-from <hash>: a small script that turns the installed renderer into this one (line hunks)
  const from = flag('--patch-from');
  if (typeof from === 'string') {
    // the old text: a local build of that version, or the committed copy of what the file runs
    const local = join(ROOT, '.out', `renderer-${from}.txt`), shared = join(ROOT, 'state', 'renderer.installed.txt');
    let oldText = existsSync(local) ? readFileSync(local, 'utf8') : null;
    if (!oldText && existsSync(shared)) { const [h, ...rest] = readFileSync(shared, 'utf8').split('\n'); if (h.trim() === from) oldText = rest.join('\n'); }
    if (!oldText) { console.log(`ERROR  no copy of renderer ${from}: run .out/install.js instead`); process.exit(1); }
    const oldSrc = oldText.split('\n');
    const newSrc = `const LIB=${LIBJSON};\n${body}`.split('\n');
    const n = oldSrc.length, m = newSrc.length, L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = oldSrc[i] === newSrc[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const hunks = []; let i = 0, j = 0, cur = null;
    while (i < n || j < m) {
      if (i < n && j < m && oldSrc[i] === newSrc[j]) { if (cur) { hunks.push(cur); cur = null; } i++; j++; }
      else if (j < m && (i === n || L[i][j + 1] >= L[i + 1][j])) { cur = cur || [i, 0, []]; cur[2].push(newSrc[j]); j++; }
      else { cur = cur || [i, 0, []]; cur[1]++; i++; }
    }
    if (cur) hunks.push(cur);
    const newText = newSrc.join('\n');
    const patch = `const H0='${from}', H1='${hash}', NS='reverse_ds', HUNKS=${JSON.stringify(hunks)};\nif (figma.root.getSharedPluginData(NS, 'renderer_hash') !== H0) return { error: 'installed renderer is not ' + H0 + ': run .out/install.js instead' };\nconst lines = figma.root.getSharedPluginData(NS, 'renderer').split('\\n');\nfor (const [at, del, add] of HUNKS.slice().reverse()) lines.splice(at, del, ...add);\nconst src = lines.join('\\n');\nif (src.length !== ${newText.length}) return { error: 'patch produced ' + src.length + ' chars, expected ${newText.length}: run .out/install.js instead' };\nfigma.root.setSharedPluginData(NS, 'renderer', src); figma.root.setSharedPluginData(NS, 'renderer_hash', H1);\nreturn { patched: H0 + ' → ' + H1, hunks: HUNKS.length };\n`;
    writeFileSync(join(ROOT, '.out', 'patch.js'), patch);
    console.log(`patch ${from} → ${hash}: ${hunks.length} hunk(s), ${(patch.length / 1000).toFixed(1)}k → .out/patch.js`);
  }
  code = `const SPECS=${JSON.stringify(clean)};\nconst OPTS=${JSON.stringify(OPTS)};\nconst H='${hash}', NS='reverse_ds';\nif (figma.root.getSharedPluginData(NS, 'renderer_hash') !== H) return { needsInstall: true, installed: figma.root.getSharedPluginData(NS, 'renderer_hash') || null, expected: H, fix: 'run .out/install.js in one use_figma call, then this call again' };\nconst AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;\nreturn await new AsyncFunction('SPECS', 'OPTS', figma.root.getSharedPluginData(NS, 'renderer'))(SPECS, OPTS);\n`;
  if (install.length > 49000) { console.log('ERROR  install script over the use_figma limit'); process.exit(1); }
  try { new (async () => {}).constructor('SPECS', 'OPTS', `const LIB=${LIBJSON};\n${body}`); } catch (e) { console.log('ERROR  renderer does not parse: ' + e.message); process.exit(1); }
  console.log(`renderer ${hash} (${(install.length / 1000).toFixed(1)}k) → .out/install.js — run it only when the call answers needsInstall`);
}
const out = flag('--out') || join(ROOT, '.out', 'call.js');
writeFileSync(out, code);
const kb = (code.length / 1000).toFixed(1);
console.log(`${specs.length} screen(s) → ${out} (${kb}k chars, limit 50k). Section: "${OPTS.section}"${OPTS.replace ? ' (replace)' : ''}`);
if (code.length > 49000) { console.log('ERROR  over the use_figma limit: split the specs into several calls'); process.exit(1); }
try { new (async () => {}).constructor(code); } catch (e) { console.log('ERROR  bundle does not parse: ' + e.message); process.exit(1); }
