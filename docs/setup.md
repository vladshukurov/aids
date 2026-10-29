# Установка

Около 10 минут. Подойдёт Claude Code или Codex, репозиторий один и тот же.

## Что нужно
1. **Доступ к Figma-файлу** «AI-ready DS» (`qUknPCIey4DG3PH19e1OmD`) и **Full- или Dev-место** в команде, которой принадлежит файл. С View- или Collab-местом Figma разрешает всего несколько MCP-вызовов в месяц, и работа встанет на первом же экране.
2. **Шрифты** там, где открыт Figma: Geist и Geist Mono, а для темы Atlas ещё Manrope и IBM Plex Mono.
3. **Node.js 18+** (`node --version`).
4. **Агент**: Claude Code (CLI, десктоп или IDE) или Codex CLI.

## Скачать
```bash
git clone https://github.com/vladshukurov/aids.git reverse-ds
```

## Claude Code
1. Откройте папку `reverse-ds` в Claude Code.
2. Подключите Figma MCP: в `/mcp` добавьте сервер `https://mcp.figma.com/mcp` (или включите коннектор Figma в настройках Claude) и войдите аккаунтом с Full- или Dev-местом.
3. Скиллы появятся сами: `/build-screen`, `/build-flow`, `/audit-screen`, `/ds-doctor` и другие.
4. Проверка: попросите «запусти ds-doctor».

## Codex
1. Откройте папку в Codex и отметьте проект как доверенный, иначе Codex не прочитает `.codex/config.toml`.
2. Войдите в Figma: `codex mcp login figma`.
3. Правила Codex берёт из `AGENTS.md`, а скиллы из `.agents/skills/`. Скилл вызывается через `$build-screen` или командой `/skills`.
4. Проверка: попросите «run $ds-doctor».

## Если не работает
| Симптом | Причина | Что сделать |
|---|---|---|
| «reached the Figma MCP tool call limit» | View- или Collab-место | Попросить у владельца файла Full- или Dev-место либо войти другим аккаунтом |
| Агент не видит компоненты | Нет доступа к файлу или устарел `state/library.json` | `ds-doctor`, затем скилл `sync-library` |
| Рендерер пишет `font … not available` | Нет шрифта | Установить Geist и Geist Mono |
| Подключено два Figma-сервера | Разные аккаунты | Агент вызывает `whoami` на каждом и работает через тот, где есть Full- или Dev-место |
