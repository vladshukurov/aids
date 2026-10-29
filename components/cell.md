# Cell, Cell Small

Figma: `Cell`, `Cell Small` · search: "cell", "list row", "transaction row"

## Use when
Any row in a list: transaction, account, goal, person, card, option in a sheet.

## Properties (Cell)
| Property | Type | Notes |
|---|---|---|
| Cell Name | text | Title: merchant, person, account. Sentence case |
| Caption | text | Under the title: category, date, "•••• 0020" |
| Amount | text | Right side amount, e.g. "−€24.90", "+€1,200.00" |
| Caption Right | text | Under the amount: balance after, status, time |
| Right | boolean | Shows the right block (Amount + Caption Right) |
| Caption Right 2 | boolean | Second caption line on the right |
| Chevron | boolean | Navigation arrow |
| Checkbox Right / Checkbox Left | boolean | Selection. In sheets use Right |
| Button | boolean | Small button on the right (e.g. "Copy") |
| Caption Left | boolean | Shows the caption under the title |
| Badge | boolean | Status badge under the amount. Set Type/Label on the exposed nested `Badge` (Warning "Pending", Success "Paid"). Turn `Caption Right 2` off when the badge is on |
| Toggle | boolean | A setting that applies at once: Toggle on the right, State on the exposed nested `Toggle`. No chevron |
The avatar is an exposed nested `Avatar`: set its Style/Type/Sublogo on it. Selection on the right/left is an exposed `Selection control` named `Selection` / `Selection Left`: turn on `Checkbox Right`, then set Type (Checkbox/Radio) and State (On/Off/Locked) on the nested instance. Locked = always selected, can’t change (e.g. "You" in a split).

Full property list with variant values: [_properties.md](_properties.md) (generated from Figma). In a spec you set the row *kind*, not these properties: [../specs/format.md](../specs/format.md#rows).

## Rules
- IMPORTANT: a row with an amount on the right has no chevron.
- IMPORTANT: amount color: incoming money `text/positive` (green) with "+"; outgoing and "you owe" stay `text/primary`.
- Radio/checkbox in sheets goes on the right.
- Rows sit inside `Block / List group` (spacing in `foundations/layout.md` §3); a group is titled with a `Section header`.
- Copyable values (IBAN, account number) are rows with `Button` "Copy", never chips.
- Same person = same photo and name everywhere in the flow.

## Cell Small
Settings and menu rows: `Icon` (instance swap, `Icon / *` or `SF / *`), Chevron for navigation, Checkbox for selection.

## Example
Transaction: Avatar `Type=Transaction, Style=Food`, Cell Name "Lidl", Caption "Groceries · 14:20", Right on, Amount "−€24.90", Caption Right "Card •••• 0020", Chevron off.
