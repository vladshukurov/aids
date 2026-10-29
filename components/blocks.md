# Blocks

Figma: Components → `09 · Blocks`. Blocks are ready compositions with the measured spacing of the product screens. Build Object screens from blocks first, atoms second. Layout numbers: `foundations/layout.md` §3. In a spec, blocks are chosen for you: `hero`, `actions`, a group with `rows`, `bottom.chat`, `overlay.sheet` (`specs/format.md`).

| Block | Use for | Properties |
|---|---|---|
| Block / Hero amount | The hero of an Object screen (account, card balance, goal, budget left) | Label, Amount, Show caption + Caption, Badge (exposed `Badge`: state such as Frozen, Paused) |
| Block / Action row | Actions on the object, 24 below the hero | Layout `Pair` (exposed `Action 1`, `Action 2` Secondary + `More`) or `Single` (exposed `Main action` Primary) |
| Block / List group | Each named section of an Object screen | exposed `Header` (Section header), exposed `Row 1`…`Row 5` (Cells), booleans Row 3–5 |
| Block / Bottom chat | Bottom of base Object screens | exposed `Suggestion 1`–`3` (questions about this object), booleans Suggestion 2–3, Suggestions |
| Block / Option sheet | A choice with consequences (replace card, which account) | exposed `SheetBar` (Title), `Option 1`–`4` (Cells with radio), booleans Option 3–4, exposed `Action` (Primary) |

## How an Object screen is assembled (the renderer does this)
```
Screen frame 402 × (874 or taller), vertical auto layout, background/primary
├─ StatusBar
├─ TopBar (Back; Title mono caps or empty)
├─ Content (vertical, 16 sides; spacing from layout.md §3 as token-bound spacers)
│   ├─ Block / Hero amount          (or Card L, or the person)
│   ├─ Block / Action row
│   ├─ Block / List group  ×2–4
└─ Block / Bottom chat              absolute, pinned to the bottom
```

## Row kinds inside a List group
Set every exposed Cell for its kind:
- **Money row:** Avatar (merchant/category/person), Cell Name, Caption (category · date), Right on, Amount, Caption Right (date or "of €326"). No chevron.
- **Action row:** Avatar icon plate, Cell Name ("Show PIN", "Limits"), Caption (current value: "Online €2,800 a month"), Chevron on.
- **State row:** Avatar icon plate, Cell Name states the state ("Card is frozen"), Caption = consequence ("Payments and withdrawals are declined"). No chevron, no right block.
- **Person row:** Avatar Image, name, caption (relationship to this object), amount or badge.

## Option sheet
Place over the object screen: full-size rectangle `background/overlay` (absolute), then the sheet pinned to the bottom. The Primary names the result ("Replace card", "Pay from Main"). Use it instead of an Alert whenever the person chooses between options.
