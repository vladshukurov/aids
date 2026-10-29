#!/usr/bin/env node
// Check the md contract against the Figma library and itself. No Figma calls.
//   node scripts/check-docs.mjs
// 1. Component docs: every `Prop=Value` and every property-table row exists in state/library.json.
// 2. Skills and agents: .claude copies are in sync with .agents/skills and agents/.
// 3. Specs: every example and scenario spec lints clean.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, readJSON, loadSpecs, lintAll, persona, libraryIcons } from './lib/spec.mjs';

const problems = [], notes = [];
const lib = readJSON('state/library.json');
const comps = lib.components || {};
const generated = !!lib.generated;
if (!generated) notes.push('state/library.json is the hand seed: property checks skipped (run the sync-library skill)');

if (generated) {
  const propsAll = {};
  for (const [n, c] of Object.entries(comps)) for (const [p, t] of Object.entries(c.props || {})) (propsAll[p] = propsAll[p] || []).push([n, t]);
  for (const f of readdirSync(join(ROOT, 'components')).filter(f => f.endsWith('.md') && !f.startsWith('_'))) {
    const md = readFileSync(join(ROOT, 'components', f), 'utf8');
    const spans = md.split('`').filter((_, i) => i % 2 === 1).filter(x => /^[A-Z][^=\n]*=[^\n]+$/.test(x) && x.length < 120);
    for (const span of spans) { const m = [null, span];
      // `Type=Primary, Size=l` (pairs) or `Style=Euro, Dollar` (one property, several values)
      let prop = null;
      for (const part of m[1].split(/,\s*/)) {
        let p, vals;
        if (part.includes('=')) { [p, vals] = part.split('='); p = p.trim(); prop = p; } else { p = prop; vals = part; }
        if (!p) continue;
        const words = p.split(' ');
        const name = words.map((_, i) => words.slice(i).join(' ')).find(n => propsAll[n]);
        if (!name) { problems.push(`${f}: \`${m[1]}\` — no component has a property "${p}"`); break; }
        prop = name;
        for (const v of vals.split(/\s*\|\s*/).map(x => x.trim()).filter(x => x && x !== '…')) {
          const owners = propsAll[name].filter(([, t]) => !['TEXT', 'BOOLEAN', 'SWAP'].includes(t));
          if (owners.length && !owners.some(([, t]) => t.split('|').includes(v))) problems.push(`${f}: \`${name}=${v}\` — not a value of ${owners.map(([n]) => n).join(', ')}`);
        }
      }
    }
    const head = md.match(/^Figma: `([^`]+)`/m);
    const owner = head && comps[head[1]];
    if (owner) {
      const sec = md.split(/^## Properties/m)[1];
      // first table of the section only; "A / B" rows name two properties
      const lines = sec ? sec.split('\n## ')[0].split('\n') : [];
      const start = lines.findIndex(l => /^\|/.test(l));
      const table = [];
      for (let i = start; start >= 0 && i < lines.length && /^\|/.test(lines[i]); i++) table.push(lines[i]);
      for (const line of table.slice(2)) for (const raw of line.split('|')[1].split(' / ')) {
        const name = raw.trim().replace(/^→\s*/, '').replace(/[`*]/g, '');
        if (name && !owner.props[name] && !owner.props['→ ' + name]) problems.push(`${f}: property "${name}" is not on ${head[1]} in Figma`);
      }
    }
  }
}

const tree = d => existsSync(d) ? execFileSync('find', [d, '-type', 'f', '-name', '*.md']).toString().trim().split('\n').filter(Boolean).sort() : [];
for (const src of tree(join(ROOT, '.agents/skills'))) {
  const dst = src.replace('/.agents/skills/', '/.claude/skills/');
  if (!existsSync(dst) || readFileSync(dst, 'utf8') !== readFileSync(src, 'utf8')) problems.push(`${dst.replace(ROOT + '/', '')} is out of sync — run node scripts/sync-agents.mjs`);
}
for (const f of readdirSync(join(ROOT, 'agents')).filter(f => f.endsWith('.md'))) {
  const dst = join(ROOT, '.claude/agents', f);
  if (!existsSync(dst) || readFileSync(dst, 'utf8') !== readFileSync(join(ROOT, 'agents', f), 'utf8')) problems.push(`.claude/agents/${f} is out of sync — run node scripts/sync-agents.mjs`);
}

const specFiles = [...readdirSync(join(ROOT, 'specs/examples')).map(f => join(ROOT, 'specs/examples', f)), ...readdirSync(join(ROOT, 'scenarios')).filter(f => f.endsWith('.json')).map(f => join(ROOT, 'scenarios', f))].filter(f => f.endsWith('.json'));
const { errors } = lintAll(loadSpecs(specFiles), { persona: persona(), icons: libraryIcons() });
for (const e of errors) problems.push('spec ' + e);

for (const n of notes) console.log('note   ' + n);
for (const p of problems) console.log('ERROR  ' + p);
console.log(problems.length ? `${problems.length} problem(s)` : 'docs, agents and specs are consistent');
process.exit(problems.length ? 1 : 0);
