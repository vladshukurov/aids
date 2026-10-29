# Scenario: Freeze a lost card and order a new one

## Brief
Alex can't find the physical card after a night out. First reaction: stop payments right now, without deciding anything. If the card is really gone, block it for good and get a new one, while still being able to pay.

## Product rules that shape the flow
- Freeze is reversible → do it immediately, no confirmation, offer Undo.
- Block is irreversible → `Alert` with the consequence before it.
- No success screens → after ordering, Alex lands on the card screen that shows the new state.
- The virtual card keeps working — say it, that is the reassurance.

## Entry points
- Card screen → round action "Freeze".
- Chat: "I lost my card" (not built here).

## Screens
| # | Screen | Recipe | Goes to |
|---|---|---|---|
| C1 | Card frozen: card L with ice, caption "Frozen · payments blocked", Primary "Unfreeze", suggestions "Undo" / "I lost it" | card-screen.md (Frozen variation) | C2 via "I lost it" |
| C2 | Alert over C1: "Block this card?" — "You can't unblock it. Your virtual card •••• 1255 keeps working" — Block card (Error) / Cancel | controls.md → Alert | C3 / back to C1 |
| C3 | Order a new card: card M preview, delivery address row, delivery row, Primary "Order new card · free" | picker.md (rows) | C4 |
| C4 | Card screen after: blocked card with Error badge, "New card on its way · 3–5 days" progress, virtual card row, Undo is gone (irreversible) | card-screen.md | — |

## Edge cases
- Card found within the same session → "Unfreeze" on C1 (or Undo right after freezing).
- Pending transactions while frozen still settle → caption on C1 is not needed for the demo.
- Address changed → address row has a chevron and opens address editing (not built).

## Numbers and data
- Physical card: Visa, Design Trickster, •••• 0020, USD account, balance $231.65.
- Virtual card: Mastercard •••• 1255, Main account, keeps working.
- Delivery: Alex Morgan, Torstraße 102, 10119 Berlin. Free, 3–5 working days, arrives by 3 Nov.
- New physical card gets new number: •••• 4417.
