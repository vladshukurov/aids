@AGENTS.md

## Claude Code specifics
- Skills: `/build-screen`, `/build-flow`, `/audit-screen`, `/sync-library`, `/ds-doctor`, `/report-friction`, `/run-evals`. Sources live in `.agents/skills/` (shared with Codex); `.claude/skills/` is a copy made by `node scripts/sync-agents.mjs`.
- Critics are subagents: `screen-critic`, `flow-reviewer`, `domain-critic`, `rules-critic` (sources in `agents/`). Spawn them with the Agent tool; give them frame ids and the spec path, not your conclusions.
- Figma MCP: the project `.mcp.json` adds the remote Figma server. If several Figma servers are connected, run `whoami` on each and use the one with a Full or Dev seat.
- Load the Figma `figma-use` skill (or the `skill://figma/figma-use/SKILL.md` resource) before the first `use_figma` call.
