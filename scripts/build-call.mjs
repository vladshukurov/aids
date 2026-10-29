#!/usr/bin/env node
// Bundle the renderer + library map + specs into one use_figma script.
//   node scripts/build-call.mjs specs/examples/profile.json [more.json] [--section "Polygon · Profile"] [--replace] [--theme Atlas] [--no-shots]
// Writes .out/call.js. Pass its full content as `code` to one use_figma call (fileKey from state/figma.json).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readJSON, loadSpecs, lintAll, persona, libraryIcons } from './lib/spec.mjs';

const args = process.argv.slice(2);
const flag = n => { const i = args.indexOf(n); return i >= 0 ? (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true) : undefined; };
const files = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && ['--section', '--theme', '--out', '--scale'].includes(args[i - 1])));
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
const components = {};
for (const [n, c] of Object.entries(lib.components)) components[n] = c.key ? { id: c.id, key: c.key, set: !!c.set } : { id: c.id };

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
// keep only the renderer parts these specs use, drop comments and indentation
const needChat = specs.some(s => s.archetype === 'chat'), needBase = specs.some(s => s.archetype !== 'chat');
const part = (src, name, keep) => keep ? src : src.replace(new RegExp(`// @${name}-begin[\\s\\S]*?// @${name}-end`), '');
let src = readFileSync(join(ROOT, 'scripts/figma/render.js'), 'utf8');
src = part(part(src, 'base', needBase), 'chat', needChat);
const render = src.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//')).join('\n');
const clean = specs.map(({ file, ...s }) => s);
const code = `const LIB=${JSON.stringify({ components, icons })};\nconst SPECS=${JSON.stringify(clean)};\nconst OPTS=${JSON.stringify(OPTS)};\n${render}\n`;

const out = flag('--out') || join(ROOT, '.out', 'call.js');
mkdirSync(join(ROOT, '.out'), { recursive: true });
writeFileSync(out, code);
const kb = (code.length / 1000).toFixed(1);
console.log(`${specs.length} screen(s) → ${out} (${kb}k chars, limit 50k). Section: "${OPTS.section}"${OPTS.replace ? ' (replace)' : ''}`);
if (code.length > 49000) { console.log('ERROR  over the use_figma limit: split the specs into several calls'); process.exit(1); }
try { new (async () => {}).constructor(code); } catch (e) { console.log('ERROR  bundle does not parse: ' + e.message); process.exit(1); }
