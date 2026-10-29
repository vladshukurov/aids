# Recipe: Transactions list

Archetype List. Build from groups; no dedicated spec yet.

## When
All payments of an account or card, "history", "what did I pay yesterday".

## Structure
1. `TopBar`: Back, title "TRANSACTIONS" (or the card "CARD •••• 0020").
2. `Search field` ("Merchant or amount") and optional filter `Chip`s (8 apart): "All", "Money in", "Card •••• 0020".
3. One section per day: "Today", "Yesterday", "24 Oct" — aside = the day's total out ("−€18.40").
4. Money rows from persona.md → Transactions: merchant avatar, caption "Category · time", amount; money in is "+" (green).
5. Bottom chat optional: "Where did I spend most?"

## Rules
- Days with one payment still get their own section (a list of days is the exception to the 2-row rule: set `"allowSingle": true`).
- Times only inside "Today"/"Yesterday"; older days show the date in the section title.
- No chevrons on money rows; the row itself opens the transaction.
