#!/usr/bin/env node
// Lint screen specs before rendering: node scripts/lint-spec.mjs specs/examples/*.json
// Exit code 1 when any spec has errors. Warnings are judgement calls: read them.
import { loadSpecs, lintAll, persona, libraryIcons } from './lib/spec.mjs';

const files = process.argv.slice(2).filter(a => !a.startsWith('--'));
if (!files.length) { console.error('usage: node scripts/lint-spec.mjs <spec.json> [...]'); process.exit(2); }
const specs = loadSpecs(files);
const { errors, warnings } = lintAll(specs, { persona: persona(), icons: libraryIcons() });
for (const e of errors) console.log('ERROR  ' + e);
for (const w of warnings) console.log('warn   ' + w);
console.log(`${specs.length} screen(s): ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
