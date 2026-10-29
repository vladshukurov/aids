# Card, Card / Linked

Figma: `Card`, `Card / Linked` · search: "card", "payment card"

## Card properties
| Property | Type | Values / notes |
|---|---|---|
| Layout | variant | E = glass plates (physical card), F = balance on the card (virtual) |
| Network | variant | Mastercard, Visa |
| Size | variant | L 320 (card screen hero), M 256 (lists of cards), S 72, XS 48 (inside rows) |
| Last 4 | text | "0020" |
| Short number | text | "•••• 0020" (L/M) |
| Balance, Balance caption | text | Layout F only |
| Card number, Expiry, CVV | text | Visible with Show details |
| Virtual | boolean | Virtual badge |
| Frozen | boolean | Ice overlay |
| Show details | boolean | Reveals number, expiry, CVV |
Card art: nested `Card / Art` → property `Design` (Trickster, Caregiver, Analyst, Silver).

## Rules
- IMPORTANT: number format "•••• 0020" (four U+2022, space, last 4). On S/XS only "0020". Never "··0020".
- A card inside a row: `Size=XS` as the avatar of `Answer / Card row` or a Cell.
- Frozen card: `Frozen=true` and the Primary action becomes "Unfreeze".
- Don't recolor or redraw card art; pick a Design.

## Card / Linked
Other banks: `Bank=Chase, Revolut, Cash App, Coinbase, Other bank`, `Size=L, M, XS`, `Last 4`. Shows "Linked". Use in top-up sources and account pickers.
