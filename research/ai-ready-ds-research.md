# AI-ready / agent-ready дизайн-системы: исследование (октябрь 2026)

Задача: собрать демо-ДС в Figma, по которой Claude через официальный Figma MCP (`search_design_system`, `get_variable_defs`, `get_design_context`, `use_figma`, Code Connect) живьём собирает экраны при клиенте.
Источники: сначала первичные (Figma, Storybook, Primer, Carbon, Google, llmstxt.org), потом авторы и конференции. Всё, что не подтверждено первоисточником, помечено **[не проверено]**.

---

## 0. Короткая хронология (для контекста)

- 03.09.2024: Jeremy Howard предлагает формат `llms.txt`, [llmstxt.org](https://llmstxt.org/).
- 04.06.2025: бета Figma MCP server, только чтение (по датам в [блоге Figma](https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents/)).
- 06.08.2025: Figma, Ana Boyer, «Design systems and AI: why MCP servers are the unlock», [figma.com/blog/design-systems-ai-mcp](https://www.figma.com/blog/design-systems-ai-mcp/).
- 16.12.2025: Brad Frost, «Agentic Design Systems in 2026» (сессия с Chromatic/Storybook про Storybook MCP), [bradfrost.com](https://bradfrost.com/blog/post/agentic-design-systems-in-2026).
- 24.03.2026: запись на канвас: `use_figma` + skills (md-инструкции для агентов), [«Agents, meet the Figma canvas»](https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents/).
- 19–20.03.2026: Into Design Systems, AI Design Systems Conference (доклады Jan Six/GitHub «agent-ready DS», Diana Wolosin/Indeed «Machine-readable DS for MCP and LLMs», Brad + Ian Frost «AI without the chaos»). Состав программы взят из неофициального пересказа: [ids-conference-2026.pages.dev](https://ids-conference-2026.pages.dev/) **[не проверено по официальному сайту]**.
- 21.04.2026: Google Labs открывает `DESIGN.md` (draft) **[дата по вторичным источникам]**.
- 28.04.2026: Ian Guisard, «Component.md», [ianguisard.substack.com/p/componentmd](https://ianguisard.substack.com/p/componentmd).
- 23.10.2026: Figma, Wayne Lin, «How to put your design system to work with the Figma agent»: guidelines у библиотеки, страница Examples, skills, [figma.com/blog](https://www.figma.com/blog/how-to-put-your-design-system-to-work-with-the-figma-agent/).

---

## 1. Что делает ДС «AI-ready»

### 1.1 Токены: primitive → semantic → component
- Три слоя: примитивы (`blue/500`), семантика по намерению (`color/interactive/default`, `bg/surface`, `text/muted`), при необходимости компонентные токены. Обязательный слой здесь семантический: без него агент угадывает смысл цвета. Примитивы скрываем из пикеров через настройки коллекции ([Vallaure, UX Collective, 31.03.2026](https://christinevallaure.substack.com/p/agentic-ai-design-systems-and-figma)).
- **Scopes переменных задаём явно.** Официальный skill `figma-use`, правило 16: по умолчанию стоит `ALL_SCOPES`, и тогда переменная засоряет любой пикер. Для фона нужен `FRAME_FILL`/`SHAPE_FILL`, для текста `TEXT_FILL`, для отступов `GAP` ([figma/mcp-server-guide › skills/figma-use](https://github.com/figma/mcp-server-guide)). От точности scopes зависит и линтер Figma «Check designs» ([help.figma.com](https://help.figma.com/hc/en-us/articles/39592284074263)).
- **Code syntax у переменных (Web/iOS/Android).** MCP отдаёт агенту именно её (например `--color-primary`), а не имя из Figma. Figma перечисляет code syntax среди того контекста, который получает агент ([Figma blog 06.08.2025](https://www.figma.com/blog/design-systems-ai-mcp/); [help: variables in Dev Mode](https://help.figma.com/hc/en-us/articles/27882809912471)).
- **Описания переменных.** Пишем коротко, когда применять. Отдаёт ли их `get_variable_defs` в ответе, официально не задокументировано **[не проверено]**. Пользу дают в любом случае: их видят и люди, и плагины.
- **Поиск идёт по имени.** `search_design_system` сопоставляет запрос с **именами переменных** («Gray/gray-9», «space/400»), а не с категориями. Поэтому имя должно само говорить о роли: `bg/surface/raised`, а не `grey-2` ([skill figma-generate-design, шаг 2b](https://github.com/figma/mcp-server-guide)).
- Моды (light/dark/brand) лучше делать модами одной коллекции, а не отдельными наборами переменных ([developers.figma.com › create skills](https://developers.figma.com/docs/figma-mcp-server/create-skills)).

### 1.2 Компоненты: имена, описания, свойства
- Компонент называем по смыслу, и имя совпадает с кодом: `ProductCard`, а не «Card v2 FINAL». Имена и значения свойств совпадают с пропсами в коде вплоть до регистра. Плохой пример: «Style: Filled» в Figma против `variant: primary` в коде ([Vallaure](https://christinevallaure.substack.com/p/agentic-ai-design-systems-and-figma)).
- **Description у каждого компонента:** назначение, состояния, поведение по умолчанию. Описание попадает в контекст агента. API Figma разрешает `description` только на `COMPONENT`/`COMPONENT_SET`, не на фрейме и не на инстансе (`figma-use`, правило 3a).
- Начинаем с вариантов, а boolean и instance swap добавляем, когда в них появляется нужда. Допустимые комбинации вариантов согласовываем заранее: Figma разрешает дыры в матрице, код нет (Vallaure).
- Отрисованы все состояния: hover, focus, disabled, error, empty, loading, skeleton. Если есть только default, агент не нарисует остальные состояния (Vallaure; [Storybook MCP](https://storybook.js.org/docs/ai/mcp/overview)).
- В статье Figma от 23.10.2026 главное: «чем яснее библиотека определяет компоненты и их поведение, тем полезнее она агенту». Отсюда требования: осмысленные имена, свойства и варианты, единообразные переменные, **паттерны, показывающие, как мелкие части собираются вместе** ([Figma blog](https://www.figma.com/blog/how-to-put-your-design-system-to-work-with-the-figma-agent/)).

### 1.3 Слоты и instance swap
- Сменный контент кладём в именованные слоты (instance swap / slot), а не детачим инстанс (Vallaure).
- У агента своя ловушка. `figma-generate-design` требует не трогать вложенные инстансы. Детачить можно только обёртку-пример. Дочерние элементы в инстанс не добавлять: всё новое идёт в обычный wrapper-фрейм. Ещё одно предупреждение оттуда же: `detachInstance()` у ребёнка неявно детачит родителя и меняет id ([skills figma-generate-design / figma-use](https://github.com/figma/mcp-server-guide)).
- Текст в инстансе меняем через `setProperties()` и text-свойства компонента. Значит, всё, что агент должен менять, нужно вынести в component properties (text, boolean, instance swap).

### 1.4 Auto layout везде, семантические имена слоёв
- Auto layout у каждого компонента, отступы на токенах, sizing выставлен осознанно (fill/hug/fixed). Слои названы по смыслу (`CardContainer`, а не «Frame 247»). Перед генерацией проверяем, что фрейм правильно тянется при ресайзе ([figma/mcp-server-guide, раздел «Structure your Figma file»](https://github.com/figma/mcp-server-guide); Vallaure).
- Аннотации и dev resources: поведение, a11y, контент, то, чего не видно глазами. Они тоже уходят агенту ([Figma blog 06.08.2025](https://www.figma.com/blog/design-systems-ai-mcp/)).

### 1.5 Документация как машиночитаемый MD
Форматы, которые сейчас реально используют:

| Формат | Что это | Источник |
|---|---|---|
| `llms.txt` | Индекс доков в Markdown: H1, blockquote-саммари, H2-списки ссылок, раздел «Optional» | [llmstxt.org](https://llmstxt.org/). Carbon упоминает llms.txt в onboarding **[по вторичному источнику]** |
| `AGENTS.md` / `CLAUDE.md` | Правила проекта для агента. Figma-skill `figma-create-design-system-rules` пишет их сам: CLAUDE.md для Claude Code, AGENTS.md для Codex, `.cursor/rules/*.mdc` для Cursor | [skills.sh › figma-create-design-system-rules](https://skills.sh/figma/mcp-server-guide/figma-create-design-system-rules) |
| Figma Make `guidelines/` | `Guidelines.md` как точка входа, `setup.md`, `overview.md`-роутеры, `components/*.md`, `composition/*.md`, `foundations/*.md` | [help.figma.com › Write design system guidelines](https://help.figma.com/hc/articles/43602393097239) |
| Library guidelines (Figma agent) | Файлы-инструкции, прикреплённые к опубликованной библиотеке (Library → Manage guidelines). Автоматически применяются к промптам с этой библиотекой | [Figma blog 23.10.2026](https://www.figma.com/blog/how-to-put-your-design-system-to-work-with-the-figma-agent/) |
| `DESIGN.md` (Google Labs) | Один файл: YAML front matter с токенами и проза «почему». Есть линтер `npx @google/design.md lint` | Вторичные: [abduzeedo](https://www.abduzeedo.com/design-md-google-ai-design-tokens), [dsebastien](https://www.dsebastien.net/design-md-specification/). Первичный: `google-labs-code/design.md` **[не открывал]** |
| `Component.md` | Спека на один компонент: API, структура (размеры и плотности), назначение цветовых токенов по состояниям, screen reader, поведение. Плюс decision tree, контрпримеры, миграция | [Ian Guisard, 28.04.2026](https://ianguisard.substack.com/p/componentmd) |
| CDF (formtrieb) | Декларативный формат: CDF Component / Profile / Target, v1.0, с MCP-сервером | [github formtrieb/cdf](https://gh.hhj520.top/formtrieb/cdf) (зеркало), [npm @formtrieb/cdf-mcp](https://socket.dev/npm/package/@formtrieb/cdf-mcp) **[нишевый проект, не стандарт]** |

**Как писать md на компонент.** Официальные рекомендации Figma (Make guidelines) применимы и к Claude:
1. **When to use**, включая соседей: Button против ButtonGroup против Link.
2. **Семантическая роль.**
3. **Правильные и неправильные примеры** рядом.
4. **API:** таблица пропсов с типами и дефолтами.
- Допустимые значения перечислены явно, недопустимые **запрещены поимённо** («не `ghost`, не `secondary`»).
- Где агенту нужно выбирать, даём decision tree: намерение → компонент, вариант, токен.
- Формулировки императивные: «Только одна `primary` на видимую секцию», а не «используйте умеренно». Жёсткие правила помечаем `IMPORTANT:`.
- Много коротких файлов лучше пары длинных (progressive disclosure). Каталог компонентов в `components/overview.md` таблицей: имя, синонимы, назначение, какой файл читать.

### 1.6 Рецепты экранов и паттерны (examples)
- В Figma: готовые эталонные экраны и блоки публикуются **как компоненты** на странице `Examples` или с суффиксом `_example` в имени (с учётом регистра; у component set суффикс ставится на родителе). Агент Figma использует их как образцы группировки и отступов ([Figma blog 23.10.2026](https://www.figma.com/blog/how-to-put-your-design-system-to-work-with-the-figma-agent/)). Это правило конкретно для Figma agent. Для Claude через MCP то же даёт `search_design_system`: skill первым запросом ищет «whole-view composite» по назначению и контейнеру («billing settings drawer») и берёт его за основу, если он покрывает 2+ секции ([figma-generate-design, шаг 2a-ii](https://github.com/figma/mcp-server-guide)).
- Вывод: **рецепт = опубликованный composite-компонент с понятным именем + md с составом и правилами.** Тогда агент находит его поиском и не собирает экран с нуля.
- Primer выставляет паттерны отдельными инструментами `list_patterns` / `get_pattern` ([primer.style › MCP](https://primer.style/product/getting-started/foundations/mcp)).

### 1.7 Правила и линтинг
- Figma «Check designs» находит захардкоженные цвета, типографику, радиусы и отступы и предлагает переменные из библиотеки. Работает на ML, без LLM. Только Org/Enterprise, по одной странице ([help.figma.com](https://help.figma.com/hc/en-us/articles/39592284074263)).
- Primer MCP: `lint_css` проверяет использование токенов. В Primer Brand MCP есть review-инструмент: неизвестные компоненты, неверные пропсы, хардкод ([primer.style](https://primer.style/product/getting-started/foundations/mcp); [npm @primer/mcp](https://cdn.jsdelivr.net/npm/@primer/mcp@0.3.4/README.md)).
- Southleft FigmaLint: плагин-аудит компонентов (хардкод, нейминг, a11y, готовность к разработке) ([southleft.com/tools](https://southleft.com/tools)).
- Figma советует оформлять аудит как skill: «флагать detached instances и hardcoded values», ревью дублей и нейминга ([Figma blog 23.10.2026](https://www.figma.com/blog/how-to-put-your-design-system-to-work-with-the-figma-agent/)).

---

## 2. Публичные примеры и доклады

**Figma (первичные)**
- MCP guide и официальные skills: [github.com/figma/mcp-server-guide](https://github.com/figma/mcp-server-guide). Папка `skills/`: `figma-use`, `figma-generate-design`, `figma-generate-library`, `figma-code-connect`, `figma-design-to-code`, `figma-create-new-file`, `figma-spec` и др. (проверено через GitHub API 29.10.2026).
- Как писать свои skills: [developers.figma.com › create-skills](https://developers.figma.com/docs/figma-mcp-server/create-skills). Папка `SKILL.md` + `references/` + `scripts/` + `assets/`. Description пишется как правило маршрутизации («когда использовать и когда нет»). Рискованные skills запускаются только вручную. Тестировать на копии файла.
- Блог 24.03.2026 про canvas для агентов и 9 skills, включая `/apply-design-system`, `/sync-figma-token`. Там же «self-healing loop»: агент снимает скриншот и чинит расхождения ([блог](https://www.figma.com/blog/the-figma-canvas-is-now-open-to-agents/)).
- Figma Make: design system package (npm, React 18 + Vite) + guidelines + «Make kit» ([developers.figma.com › bring your DS package](https://developers.figma.com/docs/code/bring-your-design-system-package/), [guidelines](https://help.figma.com/hc/articles/43602393097239)).
- Figma agent + library guidelines + Examples: [блог 23.10.2026](https://www.figma.com/blog/how-to-put-your-design-system-to-work-with-the-figma-agent/).

**Крупные ДС**
- **GitHub Primer:** официальный `@primer/mcp`, 19 инструментов: компоненты (`get_component_usage_guidelines`, `..._accessibility_guidelines`, `get_component_examples`), паттерны, токены (`find_tokens`, `get_token_usage_patterns`), `lint_css`, иконки ([primer.style](https://primer.style/product/getting-started/foundations/mcp)). Лучший публичный пример того, **какие срезы знаний нужны агенту**.
- **IBM Carbon:** Carbon MCP в public preview. Компоненты, токены, иконки, гайдлайны, код. Страницы «Prompts» и «Token conservation». В планах агентная миграция v10→v11 ([carbondesignsystem.com › Carbon MCP](https://carbondesignsystem.com/developing/carbon-mcp/overview/)). Доступ для не-IBM по запросу.
- **Shopify Polaris:** Polaris web components доступны через Shopify Dev MCP (early access с 21.05.2025) ([shopify.dev changelog](https://shopify.dev/changelog/the-shopifydev-mcp-server-now-supports-polaris-web-components)). Отдельный llms.txt у Polaris **не найден**.
- **Atlassian, Salesforce SLDS:** публичного DS-MCP или llms.txt для ДС **не нашёл**. У обоих есть только продуктовые MCP (Jira/Confluence, данные CRM). В вакансии Atlassian упомянуты «design-system patterns for AI products» ([atlassian careers](https://www.atlassian.com/company/careers/details/26377)), это слабый сигнал.
- **shadcn/ui:** официальный MCP работает с любым реестром по спецификации shadcn registry, специально включать ничего не нужно ([ui.shadcn.com/docs/registry/mcp](https://ui.shadcn.com/docs/registry/mcp)). Официальный `llms.txt` shadcn **[не подтверждён]**.
- **Storybook MCP** (`@storybook/addon-mcp`, preview): `docs-list`, `docs-show` (пропсы и примеры), `stories-preview`, `test-run` (в т. ч. a11y). Цикл: агент смотрит пропсы и примеры, чтобы не выдумывать свойства, собирает, пишет stories на состояния, гоняет тесты и чинит до зелёного. Инструкции кладутся в `AGENTS.md`/`CLAUDE.md` ([storybook.js.org](https://storybook.js.org/docs/ai/mcp/overview)).

**Люди и тексты**
- **Brad Frost:** «DS+AI» вместо vibe coding. Агент собирает UI только из материалов ДС ([пост 16.12.2025](https://bradfrost.com/blog/post/agentic-design-systems-in-2026)). Конкретных чек-листов мало, основное в его платном курсе.
- **Christine Vallaure** (UX Collective / moonlearning, 31.03.2026): самый практичный чек-лист про токены, нейминг, состояния, слоты, Code Connect и ошибки агентов ([substack](https://christinevallaure.substack.com/p/agentic-ai-design-systems-and-figma)).
- **Southleft / TJ Pitre:** «context-based design systems». FigmaLint, Design Systems Assistant MCP, Story UI, Figma Console MCP ([southleft.com/ai-design-systems](https://southleft.com/ai-design-systems/), [статья](https://www.southleft.com/insights/design-systems/what-happens-when-ai-actually-understands-your-design-system)). В одном спикерском био он указан как сотрудник Figma **[не проверено]**.
- **Into Design Systems:** AI DS Conference, март 2026 (см. хронологию). Статья «Agentic Design Systems» за пейволлом ([substack](https://intodesignsystems.substack.com/p/agentic-design-systems)).
- **Preethi Selvam,** «Making DS machine-readable for MCP and LLMs» (AI Coding Summit NYC). Метаданные как «семантический слой», автосинк, намерение отдельно от контекста ([gitnation](https://gitnation.com/contents/agentic-design-systems-making-design-systems-machine-readable-for-mcp-and-llms)).

**«CCDF»:** такого устоявшегося термина **не нашлось**. Ближайшие варианты: CDF (Component Description Format, formtrieb), Component.md, DESIGN.md (см. таблицу в 1.5). Если термин пришёл от клиента, уточнить у него.

**Билайн:** публичных материалов про ИИ-работу дизайн-системы билайна **не нашёл** (Хабр, общий веб). Есть только новость про «Билайн AI конструктор сценариев», к ДС она не относится ([kod.ru](https://kod.ru/beeline-ai-konstruktor-scenariev/amp)).

---

## 3. Структура пакета (собрано из Figma Make guidelines + skills + Storybook/Primer)

Ниже предложение. Структура собрана из официальных рекомендаций, у Figma единого стандарта нет.

```
ds-package/
├── llms.txt                     # индекс всего ниже (H1, саммари, списки ссылок)
├── AGENTS.md  (+ CLAUDE.md → @AGENTS.md)   # жёсткие правила, порядок работы, ключи файлов
├── guidelines/
│   ├── Guidelines.md            # точка входа: характер продукта + куда идти дальше
│   ├── foundations/             # color.md, typography.md, spacing.md, radius.md, modes.md, icons.md
│   │                            #   философия → группы и шаблон имён → токены с применением → комбинации
│   ├── components/
│   │   ├── overview.md          # каталог: имя | синонимы | назначение | Figma key | файл
│   │   └── button.md …          # when / don't · anatomy · props (= Figma properties) · states ·
│   │                            #   правильно/неправильно · decision tree · токены по состояниям
│   ├── composition/             # layout.md, surfaces.md, hierarchy.md, forms.md, navigation.md
│   └── content.md               # tone of voice, длина подписей, регистр, бренд
├── recipes/                     # рецепты экранов: цель → секции → компоненты (ключи) →
│   ├── onboarding.md            #   токены отступов → крайние состояния → чек-лист
│   └── dashboard.md
├── skills/                      # .claude/skills/<name>/SKILL.md (формат Figma/Anthropic)
│   ├── build-screen/            # обёртка над figma-generate-design с нашими правилами
│   ├── audit-screen/            # detached, hardcode, non-autolayout, имена слоёв
│   └── references/ scripts/     # скрипты read-back проверок для use_figma
└── evals/
    ├── prompts.md               # 10–20 типовых запросов клиента («экран оплаты», «пустое состояние»)
    ├── rubric.md                # баллы: % инстансов из библиотеки, 0 хардкода, auto layout, правила
    └── results/                 # прогоны: скриншот + метрики + находки
```

В Figma-файле ДС:
- Страницы Foundations / Components / Patterns / **Examples** (composite-компоненты рецептов).
- Описания у всех компонентов, code syntax и scopes у переменных, Code Connect, если есть код.

**Оценка вывода агента.** Готового стандарта нет. Собирается из того, что есть:
- Структурный read-back из skill `figma-generate-design` (шаг 5): число потомков по типам, отсутствие растров вместо UI, правильный шрифт.
- Один скриншот всей композиции и точечные правки.
- Линтеры: Check designs, FigmaLint или свой `audit-screen`.
- Тесты Storybook `test-run` для кода.
- Человеческое ревью визуального качества. Vallaure прямо пишет, что тесты его не ловят.

---

## 4. Как обычно идёт живое демо

По официальному `figma-generate-design` и Figma-блогам:
1. **Сессия.** `create_session(fileKey, задача)` → `sessionId` во все вызовы. Перед `use_figma` загружается skill `figma-use` (обязательно).
2. **Чтение правил.** AGENTS.md/CLAUDE.md, затем `guidelines/Guidelines.md` → нужные `components/*.md` и `recipes/*.md` (progressive disclosure).
3. **Разбор задачи.** Секции экрана → список компонентов на каждую.
4. **Поиск в ДС:**
   - Code Connect (если есть) → ключи;
   - `get_libraries` → `search_design_system` с `includeLibraryKeys`, **одно намерение на запрос**, запросы батчем, первым ищется whole-view composite;
   - переменные (`entity: "variable"`) и стили (`entity: "style"`);
   - если в файле уже есть экраны на ДС, инвентаризация берётся с них.
5. **Сборка.** Wrapper-фрейм (auto layout) → секции внутрь, у каждой привязаны переменные (`setBoundVariable`, `setBoundVariableForPaint`, `textStyleId`) → инстансы через `importComponentByKeyAsync`, тексты через `setProperties()`. Безопасные к повтору батчи, каждый вызов возвращает id.
6. **Самопроверка.** Read-back структуры → один скриншот → точечные фиксы → один пост-скриншот. Сверка с правилами из md (скриншот-цикл Figma называет «self-healing loop»).
7. **Итерация с клиентом.** Правка словами («сделай вариант для тёмной темы» означает переключение мода). Если агент повторяет ошибку, правим guidelines, библиотеку или examples, а не промпт (совет Figma 23.10.2026).

Для демо выигрышно показать: (а) агент нашёл готовый рецепт или composite, (б) все цвета на переменных и тема переключается одним модом, (в) аудит-skill даёт 0 нарушений.

---

## 5. Типичные ошибки агентов и как их предотвращает структура

| Ошибка | Почему возникает | Что предотвращает | Источник |
|---|---|---|---|
| Рисует примитивы с hex вместо инстансов | Не нашёл компонент: плохое имя, не тот запрос | Имена по роли + синонимы в `components/overview.md`; правило «search before build» в AGENTS.md | figma-generate-design |
| Хардкод цветов и отступов | Филлы не привязаны к переменным, переменных не видно (локальных нет, библиотечные не искал) | Семантические имена, scopes, правило «никогда не hex, если есть переменная»; аудит-skill | figma-generate-design 2b; Vallaure |
| Решает, что переменных нет | `getLocalVariableCollectionsAsync()` вернул пусто | Явно в правилах: всегда `search_design_system` с variables | figma-generate-design 2b |
| Детачит инстансы или добавляет детей в инстанс | Нужно поменять содержимое, а свойства не вынесены | Всё изменяемое вынести в text/boolean/instance-swap properties; слоты | figma-use; Vallaure |
| Нет auto layout, «FILL» не работает | `layoutSizing*` выставлен до `appendChild`, `resize()` после | Рецепты с порядком операций; read-back проверка | figma-use, правила 12–12c |
| Выдумывает пропсы и варианты | Нет API-таблицы или примеров | Props-таблица = Figma properties = код; список запрещённых значений | Storybook MCP; Figma guidelines |
| Нет состояний (empty, error, loading) | Нарисован только default | Все состояния в компоненте + раздел States в md + рецепт с крайними состояниями | Vallaure |
| Пересоздаёт существующие компоненты | Нет Code Connect / composite | Code Connect; публиковать composite-примеры | Vallaure; Figma blog |
| Неверный шрифт (Inter вместо продуктового) | Шрифт загрузился без ошибки | Явная проверка семейства шрифта в self-check | figma-generate-design 5 |
| Generic-вид, теряется характер бренда | Агент тянет к дефолтам | Раздел «характер продукта» в Guidelines.md, примеры, ревью человеком | Vallaure; Figma blog 06.08.2025 |
| Неоднозначный выбор (primary/secondary) | Нет правила | Decision tree + «одна primary на секцию» | Figma guidelines; блог 23.10.2026 |
| Мусор в слоях («Frame 247») | Нет нейминга | Семантические имена слоёв в компонентах и правило для агента | mcp-server-guide |

---

## 6. Что пока неизвестно / проверить руками
- Попадают ли описания компонентов и переменных в ответ именно `search_design_system` и `get_variable_defs`. Проверить на нашем файле одним вызовом.
- Работает ли правило страницы `Examples` / суффикса `_example` для поиска через MCP или только для Figma agent.
- Доступность library guidelines (Figma agent) на нашем плане и видит ли их Claude через MCP. В блоге речь только о Figma agent.
