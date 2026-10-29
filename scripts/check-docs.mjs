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
    for (const m of md.matchAll(/`([A-Z][\w ]*?)=([^`]+?)`/g)) {
      const [, p, v] = m; const owners = propsAll[p];
      if (!owners) { problems.push(`${f}: \`${p}=${v}\` — no component has a property "${p}"`); continue; }
      const variantOwners = owners.filter(([, t]) => !['TEXT', 'BOOLEAN', 'SWAP'].includes(t));
      if (variantOwners.length && !variantOwners.some(([, t]) => t.split('|').includes(v.trim()))) problems.push(`${f}: \`${p}=${v}\` — value not in ${variantOwners.map(([n, t]) => `${n} (${t})`).join(', ')}`);
    }
    const head = md.match(/^Figma: `([^`]+)`/m);
    const owner = head && comps[head[1]];
    if (owner) {
      const sec = md.split(/^## Properties/m)[1];
      if (sec) for (const line of sec.split('\n## ')[0].split('\n').filter(l => /^\| [^-]/.test(l)).slice(1)) {
        const name = line.split('|')[1].trim().replace(/^→\s*/, '');
        if (name && !owner.props[name]) problems.push(`${f}: property "${name}" is not on ${head[1]} in Figma`);
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
