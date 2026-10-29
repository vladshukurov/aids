#!/usr/bin/env node
// Skills live in .agents/skills (Codex reads them there), critics in agents/.
// Claude Code reads .claude/skills and .claude/agents: this copies them over. Edit the sources only.
//   node scripts/sync-agents.mjs
import { cpSync, rmSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './lib/spec.mjs';

rmSync(join(ROOT, '.claude/skills'), { recursive: true, force: true });
cpSync(join(ROOT, '.agents/skills'), join(ROOT, '.claude/skills'), { recursive: true });
rmSync(join(ROOT, '.claude/agents'), { recursive: true, force: true });
mkdirSync(join(ROOT, '.claude/agents'), { recursive: true });
for (const f of readdirSync(join(ROOT, 'agents')).filter(f => f.endsWith('.md'))) cpSync(join(ROOT, 'agents', f), join(ROOT, '.claude/agents', f));
console.log('synced .agents/skills → .claude/skills and agents/ → .claude/agents');
