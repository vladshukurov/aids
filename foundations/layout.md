# Layout grammar

Measured from the final re:verse product screens (card, account, budget, replace-card sheet). This is how a screen in this system is composed. Follow the numbers; they are what makes a screen look designed instead of assembled.

## 1. Think before you place anything
Write this in your reply before building:
1. **Object.** What is this screen about? (a card, an account, a goal, a choice, a money move.) One object per screen.
2. **Hero.** The one thing the person must see first: an amount, the card, a two-tone statement, a chart. Only one hero.
3. **Actions.** What can the person do with the object right now? 1 main action → Primary full width. 2 equal actions → a pair of Secondary + round "···". 0 → no action row.
4. **Sections.** What else belongs to this object? Group it into 2–4 named sections of 2–5 rows each ("Card", "Coming up", "Transactions", "Your plan"). A screen with one section of one row is not finished: think what the person would check next.
5. **State.** How is the current state shown? A state is a row inside a section ("Card is frozen · Payments and withdrawals are declined"), a badge, or a changed hero — never a lonely caption.
6. **Next step.** Chat suggestions at the bottom: 1–2 questions the person would ask about this object.

## 2. Screen archetypes
| Archetype | Use for | Skeleton |
|---|---|---|
| Object | card, account, goal, transaction, budget | header → hero → action row → sections → bottom chat |
| Picker | choose a source, recipient, people | header (title in TopBar) → search → sections of selectable rows → (Primary only if multi-select) |
| Amount | enter or confirm a sum | header → source pill → big amount → presets → keypad / confirm block |
| Sheet | choose one option with consequences, short forms | dimmed object screen behind → sheet: SheetBar with big title → options → Primary |
| Chat | Spirit answers | see recipes/chat-answer.md |
| Home feed | statements | see recipes/home-feed.md |

## 3. Zones and numbers (Object archetype)
| Zone | Content | Spacing |
|---|---|---|
| Header | `StatusBar` (62) + `TopBar` (58) | title in TopBar mono caps: "CARD •••• 0020", "BUDGET"; empty for account screens where the hero names the object |
| Hero | `Label/Hero` (15, secondary) + amount `Title/Display 2` (64) — or `Card Size=L` — or chart + statement | starts 44–60 below the header; label → amount 8; amount → extra (mini cards, statement) 16 |
| Action row | 2 × `Button Secondary l` (equal width, icon left) + round "···" 56, or 1 × Primary l full width | 24 below the hero; gap 8 |
| Sections | `Section header` + rows (`Cell`) | first section 48 below the actions; **48 between sections**; header → rows 12; **20 between rows**; side padding 16 |
| Bottom chat | fade (176) + suggestions + `BottomBar` | overlays the content; the frame ends 176 after the last section |

**Screen height.** Width 402, height 874 by default. If the content needs more room, the screen is simply taller (normal scrolling screen) — no special treatment. Don't fill empty space with a stretched spacer, and don't cut content to fit 874.

## 4. Rows
- 20 between rows inside a section (base UI). In chat, rows are 16.
- Action rows (Show PIN, Limits, Replace card): icon plate avatar + title + caption + chevron.
- Money rows: avatar (merchant/category/person) + title + caption (category, date) + amount + caption right (date or "of €326"). No chevron.
- State rows: icon plate + title states the state ("Card is frozen") + caption says the consequence ("Payments and withdrawals are declined"). No chevron.
- Every caption carries information. "Requested · just now" is weak; "Requested · pays back in re:verse" says what happens.

## 5. Typography hierarchy on one screen
| Level | Style | Max per screen |
|---|---|---|
| Hero | `Title/Display 2` (64) amount, or `Title/Title 1` statement | 1 |
| Statement under a chart | `Title/Title 4`/20 two-tone | 1 |
| Section titles | `Section/Title` (17) | 2–4 |
| Row titles | `Body/Medium` via Cell | — |
| Captions | mono via Cell (`Caption/Regular`) | — |
Mono is for captions and labels only. Never set body copy in mono.

## 6. Sheet anatomy (measured)
- Behind: the object screen, dimmed with `background/overlay`.
- Sheet: `fill/sheet`, top radius Theme `radius/sheet`, side padding 16.
- `SheetBar Type=Title` with a big title ("Replace card"), then options 24 below.
- Options: rows with title + consequence caption ("Cancelled now · new card in 3–5 days") and a radio on the right; 12 between options.
- Bottom: Primary l, padding 24 top / 36 bottom; it is disabled until an option is picked.
- A choice with consequences belongs in a sheet. An `Alert` is only for a yes/no that cannot be undone and has no options.

## 7. Composition checks (run them on your screenshot)
- No empty band taller than 96 between content blocks.
- The hero is the largest thing on the screen and is above the fold.
- Exactly one place draws the eye first; the second is the action row.
- Left edges line up on 16; nothing floats centered unless it is the hero card or an empty state.
- Each section has at least 2 rows; one-row sections are merged or turned into a row elsewhere.
- Compare with the closest reference screen at the same scale: if yours looks emptier or flatter, add the missing section or hero detail, don't add decoration.
