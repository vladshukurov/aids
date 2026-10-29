# План (статус на 29.10.2026)

Решения: re:verse как есть + слой тем; Figma + MD-пакет; md на английском, README на русском; v1 ≈ 25 компонентов (ядро Kit, Card, Chip, Suggest, Answer/*, MD/Block); компоненты скопированы из re:verse и вычищены.

| # | Этап | Статус |
|---|---|---|
| 0 | Каркас пакета, git | готово |
| 1a | Файл самостоятельный: локальные переменные (7 коллекций), 28 текстовых стилей, Blur/Glass, ~60 служебных компонентов на `_internal`; ноль ссылок на re:verse и iOS-киты | готово |
| 1b | Страницы: Cover, Foundations, Components, Examples, Polygon, ---, _internal, два архива; компоненты v1 перенесены в секции Components | готово |
| 1c | Токены: коллекции переименованы (Primitives / Color и Type скрыты, Color, Type, Size, Theme, Spirit persona, Platform); scopes и code syntax WEB/iOS у всех 191; описания у 69 семантических; Theme re:verse / Atlas (action, accent, radius control/field/card/sheet, font text/mono); семантика и 27 текстовых стилей подвешены на Theme | готово |
| 2 | Компоненты v1: 73 радиуса → Theme radius/control/field/card, 83 текста без стиля → семейства Type (Atlas меняет шрифт и скругления); 7 переименований, `_` у служебных, `Icon /` у 39 иконок; описания у 46. Починено после переноса: явные режимы (dark чата) на 392 фреймах; режимы наложения (184 мастера + 259 инстансов, клавиатура отвязана от переменных — API не держит blend на привязанной заливке). Свойства Answer/* без text-properties — текст правится через characters | готово |
| 3 | MD: foundations (tokens, theming, typography, voice), components (overview + 10 файлов) | готово |
| 4 | Examples: 9 эталонов `*_example` (home, card, account, picker, amount, confirm, 3 чата) + recipes (6) | готово |
| 5 | Skills: build-screen, build-flow, audit-screen; агент flow-reviewer; scripts/audit-screen.js | готово |
| 6 | Полигон и evals: два холодных прогона (19/20 и 18/20), все находки исправлены в компонентах и доках, журнал `evals/log.md`. Файл организован: Cover, доски Foundations, нумерованные секции, Examples по группам | готово |
| 6b | Опубликовать библиотеку (руками в Figma) → проверить search_design_system и описания; прогнать остальные запросы из prompts.md и build-flow | |
| 7 | Демо: сценарии показа, 2–3 скринкаста | |

## Проверить на практике (не подтверждено источниками)
- Отдают ли `search_design_system` / `get_variable_defs` описания компонентов и переменных.
- Влияет ли страница Examples / суффикс `_example` на поиск через MCP.
- Видны ли library guidelines Claude через MCP.
