# Scenario: Split a dinner bill

## Brief
Alex paid €84.00 for dinner at Tavola last night with Anna and Dima. Alex wants each of them to pay back their share without typing amounts or IBANs.

## Entry points
- Transaction details of "Tavola" → "Split".
- Home statement "You paid €84 at Tavola. Split it?" → suggestion "Split with friends".
- Chat: "split last night's dinner" (not built here).

## Screens
| # | Screen | Recipe | Goes to |
|---|---|---|---|
| S1 | Who was there: search + recent people with checkboxes, Alex is always included | picker.md | S2 |
| S2 | Amounts: avatar group, total, equal split toggle, one row per person, Primary "Request €56" | money-move.md (amount) | S3 |
| S3 | Transaction details after requests: progress of money back, people with Pending badges, Undo chip | — (object screen) | — |

## Edge cases
- Max Weber is not on re:verse → he gets a payment link; badge "Link sent".
- Someone already paid → badge "Paid" (Success, money in) and progress moves.
- Uneven split: Toggle off → amounts become editable rows.
- Undo within the session: chip "Undo" cancels requests.

## Numbers
- Total €84.00 (Tavola, 25 Oct, 21:40, card •••• 1255 on Main account).
- 3 people × €28.00. Alex keeps €28.00; requests: Anna €28.00, Dima €28.00 → "Request €56".
- S3 progress: €0 of €56 back (0%), both Pending.
- Anna Costa and Dima Ivanov are on re:verse (requests in-app, no fee).
