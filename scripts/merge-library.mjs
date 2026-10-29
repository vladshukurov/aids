#!/usr/bin/env node
// Merge page dumps (scripts/figma/dump-library.js results) into state/library.json and
// regenerate components/_properties.md (the property reference agents read).
//   node scripts/merge-library.mjs .out/lib-components.json .out/lib-internal.json
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readJSON } from './lib/spec.mjs';

const files = process.argv.slice(2);
if (!files.length) { console.error('usage: node scripts/merge-library.mjs <dump.json> [...]'); process.exit(2); }
const fig = readJSON('state/figma.json');
const lib = { fileKey: fig.fileKey, generated: new Date().toISOString(), source: 'scripts/figma/dump-library.js', components: {}, icons: {}, variables: {}, variableNames: [], textStyles: [] };
for (const f of files) {
  const d = JSON.parse(readFileSync(f, 'utf8'));
  for (const [n, c] of Object.entries(d.components || {})) if (!lib.components[n]) lib.components[n] = Object.assign({ page: d.page }, c);
  Object.assign(lib.icons, d.icons || {});
  if (d.variables) { lib.variables = d.variables; lib.variableNames = d.variableNames; lib.textStyles = d.textStyles; }
  if (d.dupes && d.dupes.length) console.log(`warn   duplicate names on ${d.page}: ${d.dupes.join(', ')}`);
}
writeFileSync(join(ROOT, 'state/library.json'), JSON.stringify(lib, null, 1) + '\n');

// components/_properties.md — generated, never edit by hand
const pub = Object.entries(lib.components).filter(([n]) => !n.startsWith('_')).sort(([a], [b]) => a.localeCompare(b));
let md = '# Component properties (generated)\n\nGenerated from Figma by `scripts/merge-library.mjs` on ' + lib.generated.slice(0, 10) + '. Do not edit: rerun the sync-library skill. When and how to use each component: the other files in this folder.\n\n';
md += '| Component | Variants | Text | Boolean | Swap | Exposed nested |\n|---|---|---|---|---|---|\n';
const esc = s => s.replace(/\|/g, ' / ');
for (const [n, c] of pub) {
  const p = Object.entries(c.props || {});
  const v = p.filter(([, t]) => !['TEXT', 'BOOLEAN', 'SWAP'].includes(t)).map(([k, t]) => `${k}: ${esc(t)}`).join('<br>');
  const pick = t => p.filter(([, x]) => x === t).map(([k]) => k).join(', ');
  md += `| ${n} | ${v} | ${pick('TEXT')} | ${pick('BOOLEAN')} | ${pick('SWAP')} | ${(c.nested || []).join(', ')} |\n`;
}
writeFileSync(join(ROOT, 'components/_properties.md'), md);

// components/icons.md — icon list part (the meaning table above the marker is hand-kept)
const iconsPath = join(ROOT, 'components/icons.md');
const names = Object.keys(lib.icons).sort();
const list = '<!-- generated:icons -->\n## All icons in the library (' + names.length + ')\n' + names.map(n => '`' + n + '`').join(' · ') + '\n';
try {
  const cur = readFileSync(iconsPath, 'utf8');
  writeFileSync(iconsPath, cur.split('<!-- generated:icons -->')[0] + list);
} catch { writeFileSync(iconsPath, '# Icons\n\n' + list); }
console.log(`state/library.json: ${pub.length} components, ${names.length} icons, ${lib.variableNames.length} variables, ${lib.textStyles.length} text styles`);
