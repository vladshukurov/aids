# Recipe: Card screen

Spec: `scenarios/freeze-card.json` (c1 frozen, c4 blocked) · archetype Object

## When
A card: its state, limits, PIN, replacement, what was paid with it.

## Structure
1. `TopBar`: Back, title "CARD •••• 0020".
2. Hero: the card, `Card Size=L` (Layout E physical, F virtual), centered — the only centered element.
3. Action row: pair "Add money" / "Freeze" + "···" when active; single Primary "Unfreeze" when frozen.
4. Section "Card": state row first when the card has a state, then action rows: "Show PIN", "Limits" ("Online $2,500 a month"), "Replace card" ("New card in 3–5 days · free").
5. Section "Transactions", aside "View all": 3 money rows paid with this card (persona.md).
6. Bottom chat: 1–2 questions ("Why was it declined?").

## Rules
- Card number "•••• 0020" on L/M, "0020" only on S/XS.
- Card balance in USD for •••• 0020 (USD account).
- Never redraw card art; pick `Card / Art` Design.

## Variations
- **Frozen** (reversible, happens at once): `frozen: true`, single Primary "Unfreeze", first row "Card is frozen · Payments and withdrawals are declined", first chip "Undo". No confirmation.
- **Block** (irreversible): `Alert` destructive over the screen — "Block this card?" / the consequence and what keeps working. Full flow: `scenarios/freeze-card.md`.
- **Blocked**: frozen art, row with Badge Error "Blocked", `Progress` for the new card's delivery, row with the virtual card that keeps working. No Undo.
- **Details**: `Show details=true`, copy rows (Button "Copy") for number and expiry.
