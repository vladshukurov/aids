# Layout grammar

Measured from the final re:verse product screens (card, account, budget, replace-card sheet). This is how a screen in this system is composed. IMPORTANT: this file is the only place spacing numbers live; other files link here. The renderer (`scripts/figma/render.js`) applies them, so a spec never sets spacing by hand.

## 1. Think before you place anything
Write this in your plan before the spec:
1. **Object.** What is this screen about? (a card, an account, a goal, a choice, a money move, the person.) One object per screen.
2. **Hero.** The one thing the person must see first: an amount, the card, the person, a two-tone statement (home only). Only one hero.
3. **Actions.** What can the person do with the object right now? 1 main action → Primary full width. 2 equal actions → a pair of Secondary + round "···". 0 → no action row.
4. **Sections.** What else belongs to this object? Group it into 2–4 named sections of 2–5 rows each ("Card", "Coming up", "Transactions", "Security"). A screen with one section of one row is not finished: think what the person would check next.
5. **State.** How is the current state shown? A row inside a section ("Card is frozen · Payments and withdrawals are declined"), a badge on the hero, or a changed hero — never a lonely caption.
6. **Next step.** Base screens end with the bottom chat: 1–2 questions the person would ask about this object.

## 2. Screen archetypes
| Archetype | Use for | Skeleton | Recipe |
|---|---|---|---|
| Object | card, account, goal, transaction, budget, profile | header → hero → action row → sections → bottom chat | account, card-screen, profile |
| List | settings, notifications, all transactions | header (title in TopBar) → sections → (bottom chat optional) | settings, transactions |
| Picker | choose a source, recipient, people | header (title in TopBar) → search → sections of selectable rows → (Primary only if multi-select) | picker |
| Amount | enter a sum | header → source pill → big amount → presets → keypad | money-move |
| Confirm | check before money moves or an order | header → from → to → amount hero → bottom Primary | money-move |
| Sheet | one choice with consequences, short forms | dimmed screen behind → sheet: SheetBar with title → options → Primary | §6 |
| Chat | assistant answers | see recipes/chat-answer.md | chat-answer |
| Home feed | statements | see recipes/home-feed.md | home-feed |

## 3. Spacing (base UI)
| Between | Space | Token |
|---|---|---|
| Header → hero (first block) | 48 | `space/48` |
| Header → first block that is not a hero (search, segmented, group) | 24 | `space/24` |
| Hero label → amount | 8 | inside `Block / Hero amount` |
| Hero → action row | 24 | `space/24` |
| Hero or action row → first section | 48 | `space/48` |
| Section → section | 48 | `space/48` |
| Search, segmented control or chips → section | 24 | `space/24` |
| Section header → first row | 12 | inside `Block / List group` |
| Row → row inside a section | 20 | inside `Block / List group` |
| Last section → end of content (bottom chat screens) | height of `Block / Bottom chat` | renderer |
| Side padding | 16 | `space/screen margin` |
| Action row buttons | 8 | inside `Block / Action row` |
| Bottom CTA | 24 above, 16 sides, `HomeIndicator` below | renderer |

Other contexts:
- Chat: rows 16 apart; answer parts by the pair rule in `components/chat.md`.
- Sheet options: 12 apart (inside `Block / Option sheet`).
- Text fields: 16 apart.
- Chips and suggestions in a row: 8.

**Screen height.** Width 402, height 874 by default. If the content needs more room, the screen is simply taller (a normal scrolling screen): the bottom chat stays pinned to the bottom of the frame. Don't fill empty space with a stretched spacer, and don't cut content to fit 874. Exception: confirm and amount screens keep 874 and push the CTA to the bottom.

## 4. Rows
- Action rows (Show PIN, Limits, Replace card): icon plate avatar + title + caption (current value) + chevron.
- Money rows: avatar (merchant/category/person) + title + caption (category · date) + amount + optional caption right. No chevron.
- State rows: icon plate + title states the state ("Card is frozen") + caption says the consequence ("Payments and withdrawals are declined"). No chevron.
- Toggle rows: a setting that applies at once; caption says what exactly happens. No chevron, no Save button.
- Every caption carries information. "Requested · just now" is weak; "Requested · pays back in re:verse" says what happens.

## 5. Typography hierarchy on one screen
| Level | Style | Max per screen |
|---|---|---|
| Hero | amount in `Block / Hero amount` (`Title/Display 2`, 64), the card L, or a person name `Title/Display 3` (36) | 1 |
| Statement (home only) | `Title/Title 1` two-tone | 1 per statement |
| Section titles | `Section/Title` (17) via `Section header` | 2–4 |
| Row titles | `Body/Medium` via Cell | — |
| Captions | mono via Cell (`Caption/Regular`) | — |
Mono is for captions and labels only. Never set body copy in mono.

## 6. Sheet anatomy (measured)
- Behind: the object screen, dimmed with `background/overlay`.
- Sheet: `Block / Option sheet` — `fill/sheet`, top radius Theme `radius/sheet`, side padding 16.
- `SheetBar Type=Title` with a big title ("Replace card"), then options 24 below.
- Options: rows with title + consequence caption ("Cancelled now · new card in 3–5 days") and a radio on the right; 12 between options.
- Bottom: Primary l that names the result ("Replace card", "Pay from Main"), padding 24 top / 36 bottom.
- A choice with consequences belongs in a sheet. An `Alert` is only for a yes/no that cannot be undone and has no options.

## 7. Composition checks (run them on your screenshot)
- No empty band taller than 96 between content blocks.
- The hero is the largest thing on the screen and is above the fold.
- Exactly one place draws the eye first; the second is the action row.
- Left edges line up on 16; nothing floats centered unless it is the hero card or an empty state.
- Each section has at least 2 rows; one-row sections are merged or turned into a row elsewhere.
- Compare with the closest example screen at the same scale (`evals/references.md`): if yours looks emptier or flatter, add the missing section or hero detail, don't add decoration.
