# Test prompts

Typical client requests. Run each through `build-screen` (or `build-flow` for F*), audit, score with the rubric, log results in `evals/log.md`. A prompt with a spec has a golden answer: compare the agent's spec with it.

## Screens
| # | Prompt | Golden spec |
|---|---|---|
| 1 | Send €40 to Anna: the amount screen. | — (Amount has no block yet) |
| 2 | Confirmation before sending €40 to Anna Costa from Main account. | `specs/examples/send-confirm.json` → send-confirm |
| 3 | Card screen with the card frozen. | `scenarios/freeze-card.json` → c1 |
| 4 | Account screen for a USD account with three sub-wallets. | `specs/examples/account-usd.json` |
| 5 | Bottom sheet: choose which account to pay from (3 accounts). | `specs/examples/send-confirm.json` → send-pay-from |
| 6 | Home: salary just arrived, suggest planning the month. | — |
| 7 | Home: a subscription price went up. | — |
| 8 | Spirit answer: "How much did I spend on food in October?" | `specs/examples/chat-food-october.json` |
| 9 | Spirit answer: "Can I afford a €900 laptop this month?" | — |
| 10 | Spirit answer: confirm moving €100 to the Spain trip goal. | `specs/examples/chat-spain-topup.json` → chat-spain-check |
| 11 | Transactions list for today and yesterday. | — (recipe transactions.md) |
| 12 | Settings menu with 6 rows. | `specs/examples/profile.json` (menu part) |
| 13 | Empty state: no linked banks in "Top up from". | — |
| 14 | Profile. | `specs/examples/profile.json` |
| 15 | Notification settings. | `specs/examples/notifications.json` |
| 16 | Spirit answer: "When does my salary land?" | `specs/examples/chat-salary.json` |

## Flows (build-flow)
- F1. Split a dinner bill of €84 with two friends. → `scenarios/split-bill.md`
- F2. Freeze a lost card and order a new one. → `scenarios/freeze-card.md` + `scenarios/freeze-card.json`
- F3. Top up the Spain trip goal from the chat. → `specs/examples/chat-spain-topup.json`
