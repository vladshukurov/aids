# Spirit chat: Chat / Top bar, Chat / User message, Answer / *, MD / Block, BottomBar

The chat is a dark screen (`Color` mode `dark`) over the Spirit gradient. Spirit is the AI assistant; it exists only here.

## Screen anatomy
`StatusBar` → `Chat / Top bar` (topic title) → messages (vertical auto layout, 16 side padding) → suggestions row → `BottomBar` → `HomeIndicator`.

## One answer = vertical stack, itemSpacing 0, spacing via `Answer / Space`
| Part | Component | Notes |
|---|---|---|
| Person's message | `Chat / User message` (or `Answer / Ask`) | right-aligned |
| Lead | `Answer / Lead` | white answer + grey continuation on a new line. Max 3 lines when a block follows |
| Hero number | `Answer / Number` | only money the person has (balance, total) or the transfer sum |
| 2–3 numbers | `Answer / Number row` | comparisons, "was → now" (old value grey) |
| Paragraph | `Answer / Body` | 1–3 sentences |
| Section title | `Answer / H3` | long answers only |
| List | `Answer / List item` | 3–6 items; Number type only for steps |
| Table | `Answer / Table row` | Head + Rows, 2–3 columns, no lines between rows |
| Rows | `Cell` (no chevron) / `Answer / Card row` | accounts, transactions, recipients |
| Check before money moves | `Answer / Check` | from → to, Transfer amount, caption "SEPA INSTANT · NO FEE · ARRIVES IN SECONDS" |
| Face ID | `Answer / Face ID` | only when money leaves re:verse or for secrets |
| Meta | `Answer / Meta` | source · time, last |
Richer formatting (callout, key-value, bars, details) → `MD / Block` with `Type=…`.

## Spacing pair rule (`Answer / Space` Size)
| After → before | Size |
|---|---|
| User message → anything | 28 |
| Lead → Number | 8 |
| Lead → Body, List, Meta | 20 |
| Lead → Rows, Table, Number row, Check | 28 |
| Number, Number row, Rows, Table, Check, List → Body, Meta | 20 |
| Body → Body | 12 |
| Body → List | 12 |
| anything → H3 | 28 |
| H3 → text | 8 |
| Number row, Table → Meta | 28 |
| otherwise | 28 |

## Rules
- IMPORTANT: one main thought per answer: one Lead or one Number, plus at most one GUI piece (rows, table, check).
- Default answer is plain text (1–3 sentences in Body). Use a Lead only for yes/no, one number, a result, a question or a greeting.
- No full stop at the end of sentences, list items and captions.
- Follow-ups are `Suggest Theme=Dark` above `BottomBar`, 1–2 usually. See [chip-suggest.md](chip-suggest.md).
- Transfer flow: collect → ask one missing thing → Check + three chips ("Send €40" / "Other amount" / "Cancel") → Face ID → "Sent. / Anna gets it in seconds" + a receipt row. No success screen.
- Voice: [../foundations/voice.md](../foundations/voice.md).
