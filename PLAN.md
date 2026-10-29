# План (статус на 29.10.2026)

Решения: re:verse как есть + слой тем; Figma + MD-пакет; md на английском, README на русском; v1 ≈ 25 компонентов (ядро Kit, Card, Chip, Suggest, Answer/*, MD/Block); компоненты скопированы из re:verse и вычищены.

| # | Этап | Статус |
|---|---|---|
| 0 | Каркас пакета, git | готово |
| 1a | Файл самостоятельный: локальные переменные (7 коллекций), 28 текстовых стилей, Blur/Glass, ~60 служебных компонентов на `_internal`; ноль ссылок на re:verse и iOS-киты | готово |
| 1b | Страницы: Cover, Foundations, Components, Examples, Polygon, ---, _internal, два архива; компоненты v1 перенесены в секции Components | готово |
| 1c | Токены: коллекции переименованы (Primitives / Color и Type скрыты, Color, Type, Size, Theme, Spirit persona, Platform); scopes и code syntax WEB/iOS у всех 191; описания у 69 семантических; Theme re:verse / Atlas (action, accent, radius control/field/card/sheet, font text/mono); семантика и 27 текстовых стилей подвешены на Theme | готово |
| 2 | Компоненты v1: имена, свойства, описания, состояния. **Привязать радиусы к Theme radius/*, подписи — к текстовым стилям**, иначе Atlas меняет только цвет | |
| 3 | MD: foundations, components/*, правила продукта | |
| 4 | Examples: 8–10 эталонных экранов-компонентов + recipes/* | |
| 5 | Skills: build-screen, build-flow, audit-screen; агент-ревьюер | |
| 6 | Полигон и evals: 15 запросов, рубрика, правки доков до стабильного результата | |
| 7 | Демо: сценарии показа, 2–3 скринкаста | |

## Проверить на практике (не подтверждено источниками)
- Отдают ли `search_design_system` / `get_variable_defs` описания компонентов и переменных.
- Влияет ли страница Examples / суффикс `_example` на поиск через MCP.
- Видны ли library guidelines Claude через MCP.
