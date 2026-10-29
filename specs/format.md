# Screen spec format

A screen is described as JSON and rendered by `scripts/figma/render.js`. You write *what* is on the screen; the renderer places the system's blocks with the measured spacing (`foundations/layout.md`) and the row rules (`components/cell.md`). Start from the closest file in `specs/examples/`.

```
node scripts/lint-spec.mjs my-screen.json                  # rules check, no Figma needed
node scripts/build-call.mjs my-screen.json --section "Polygon · Profile"
# → .out/call.js: pass its whole content as `code` to one use_figma call
#   answer { needsInstall } → run .out/install.js once (or add --patch-from <hash> and run .out/patch.js), then the call again
#   --replace re-renders frames with the same name in place; --theme Atlas; --no-shots
```

A file holds one screen, an array of screens, or `{ "flow": "Freeze card", "screens": [ … ] }`. Screens of one flow go into one call so links between them become prototype connections.

## Screen
| Key | Values | Notes |
|---|---|---|
| `id` | `"profile"` | Unique in the call; used by `links` |
| `name` | `"Profile"` | Frame name |
| `caption` | one line | Shown above the frame on the canvas: what happens and why, for a PM reading cold |
| `archetype` | `object` `list` `picker` `sheet` `amount` `confirm` `home` `chat` | `foundations/layout.md` §2 |
| `mode` | `light` (default) `dark` | Chat is always dark |
| `theme` | `re:verse` (default) `Atlas` | Brand mode |
| `topbar` | `{ "title": "CARD •••• 0020", "back": true, "close": false, "avatar": false, "right": "<icon>", "subtitle": "…" }` | Title mono caps 1–2 words; no title when the hero names the object |
| `body` | list of blocks | Top to bottom; spacing is automatic |
| `bottom` | `{ "chat": ["Why was it declined?"] }` or `{ "cta": "Send €40", "ghost": "Not now" }` or `{ "keyboard": true }` | Object screens end with the bottom chat; confirm/amount screens with a CTA |
| `overlay` | `{ "sheet": … }` or `{ "alert": … }` | Drawn over the dimmed screen |
| `links` | `[{ "from": "cta", "to": "c2" }]` | Prototype taps; see Links |

## Blocks (`body`)
| Block | Example | Renders |
|---|---|---|
| Hero amount | `{ "hero": "amount", "label": "USD account", "amount": "$313.00", "caption": "…", "badge": { "type": "Error", "label": "Blocked" } }` | `Block / Hero amount` |
| Hero card | `{ "hero": "card", "last4": "0020", "layout": "E", "network": "Visa", "design": "Trickster", "frozen": true }` | `Card Size=L`, centered |
| Hero person | `{ "hero": "person", "name": "Alex Morgan", "caption": "ID verified · since Mar 2024" }` | Avatar 96 + name `Title/Display 3` + `Label/Hero` caption |
| Statement | `{ "statement": ["Salary is in, €2,400", "plan the rest of October?"] }` | Two-tone `Title/Title 1`. Home only |
| Actions | `{ "actions": [{ "label": "Top up", "icon": "plus" }, { "label": "Send", "icon": "arrow.up" }] }` or `{ "actions": ["Unfreeze"] }` | `Block / Action row`: 2 → Secondary pair + "···", 1 → Primary full width |
| Group | `{ "group": "Card", "aside": "View all", "rows": [ … ] }` | `Block / List group` (2–5 rows); more rows or toggle rows → Section header + Cells |
| Chips | `{ "chips": ["€20", { "label": "€50", "selected": true }, "Max"] }` | `Chip` row |
| Segmented | `{ "segmented": ["Physical", "Virtual"] }` | `Segmented control` |
| Search | `{ "search": "Name, phone or IBAN" }` | `Search field` |
| Progress | `{ "progress": { "value": 11, "label": "€400 of €3,500", "valueText": "11%" } }` | `Progress` (nearest 0/25/50/75/100) |
| Empty | `{ "empty": { "title": "No linked banks", "text": "…", "icon": "building.columns", "action": "Link a bank" } }` | `Empty state` |
| Fields | `{ "fields": [{ "label": "IBAN", "placeholder": "DE89 …", "caption": "…", "state": "Error" }] }` | `Text Field` stack |
| From → to | `{ "fromTo": { "from": <row>, "to": <row> } }` | Two Cells joined by `Icon / arrow-down` (confirm) |
| Text | `{ "text": "…", "style": "Body/Small", "color": "text/secondary" }` | Rare. Prefer a row caption |
| Any component | `{ "component": "Amount", "props": { … }, "nested": { "Badge": { … } }, "texts": { "Layer": "…" } }` | Escape hatch for parts with no block yet. Say so in the report |

`"gapBefore": 32` on any block overrides the automatic spacing. Use it only with a reason.

## Rows
Every row is a `Cell`. The kind decides chevron, right block and selection; you don't set those by hand.

| Kind | Keys | Result |
|---|---|---|
| `money` | `title`, `caption` ("Dining · 25 Oct"), `amount` ("−$31.50", "+€25.00"), `captionRight` | Amount right, no chevron. "+" turns the amount green (`text/positive`), anything else stays neutral |
| `action` | `title`, `caption` (current value: "Online $2,500 a month") | Chevron |
| `state` | `title` ("Card is frozen"), `caption` (consequence) | No chevron, no right block |
| `person` | `title`, `caption`, `amount` or `badge` | Avatar photo or initials from persona.md |
| `toggle` | `title`, `caption`, `toggle: true/false` | Toggle on the right |
| `select` | `title`, `caption`, `select: "radio"/"checkbox"`, `selected`, `locked` | Selection control on the right |
| `copy` | `title`, `caption`, `button: "Copy"` | Small button on the right |

The kind is inferred when omitted: `toggle` key → toggle, `select` → select, `amount` → money, `button` → copy, `chevron: false` → state, otherwise action.

Avatar (`"avatar": …`): `{ "person": "Anna Costa" }`, `{ "currency": "Euro" }` (Euro, Dollar, Pound, USDT, USDC), `{ "merchant": "Food" }` (Food, Market, Home, Car, Netflix, Revolut, Coinbase, CashApp, Bells, Send, Plus), `{ "goal": true }`, `{ "logo": "re:verse" }`, `{ "icon": "lock" }` (grey plate with an SF outline icon, see `components/icons.md`), or `false` for no avatar.

Badge: `"badge": { "type": "Warning", "label": "Pending" }` (Neutral, Info, Warning, Error, Success — Success only for money received).

## Overlays
```json
"overlay": { "sheet": { "title": "Pay from", "action": "Pay from Main",
  "options": [ { "title": "Main account", "caption": "€1,340.00", "avatar": { "currency": "Euro" }, "selected": true }, … ] } }
"overlay": { "alert": { "title": "Block this card?", "message": "You can't unblock it…", "action": "Block card", "cancel": "Cancel", "destructive": true } }
```
Sheet = a choice with consequences (2–4 radio options + Primary). Alert = an irreversible yes/no only.

## Chat screens (`"archetype": "chat"`)
| Key | Example |
|---|---|
| `persona` | `neutral` `analyst` `trickster` `caregiver` — glow and `voice/*` copy |
| `topic` | `"SPAIN TRIP"` (Chat / Top bar title) |
| `ask` | the person's message |
| `answer` | list of parts, spacing by the pair rule in `components/chat.md` |
| `suggest` | 1–3 follow-ups; a money Check has exactly three: "Top up €100" / "Other amount" / "Cancel" |

Answer parts: `{ "lead": ["€1,000 on food", "most of it eating out"] }` (white + grey; `"$voice/confirm"` binds a persona variable), `{ "body": "Dining is €72 more than in September. **€43 over** at this pace" }` (`**bold**`), `{ "number": ["€1,340.00", "Main account"] }`, `{ "numberRow": [["€612", "Dining"], ["€388", "Groceries"]] }`, `{ "h3": "…" }`, `{ "list": ["…", "…"] }`, `{ "rows": [<row>, …] }`, `{ "check": { "label": "You top up", "amount": "€100", "caption": "NO FEE · INSTANT", "from": <row>, "to": <row> } }`, `{ "faceId": true }`, `{ "meta": "Card and account payments · 1–26 Oct" }`.

## Links (prototype)
`"links": [{ "from": "<element>", "to": "<screen id>" | "back" }]`. Elements: `cta`, `ghost`, `cancel`, `back`, `action:<label>`, `row:<title>`, `suggest:<label>`. Build the screens of a flow in one call so the targets exist.

## What the renderer does not decide
Content. Which sections an object has, which rows, which captions and numbers — that is the plan (layout.md §1) and the data (persona.md). The linter catches rule slips; the critic judges the result.
