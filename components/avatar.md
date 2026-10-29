# Avatar, Sublogo

Figma: `Avatar`, `Sublogo` · search: "avatar", "merchant icon", "currency icon"

## Properties
| Property | Values | Use |
|---|---|---|
| Type | Avatar | People. `Style=Image` for a photo, `Style=Default` (initials) for people not on re:verse |
| Type | Currency | Accounts by currency: `Style=Euro, Dollar, Pound, USDT, USDC` |
| Type | Transaction | Merchants and categories: `Style=Food, Market, Home, Car, Netflix, Revolut, Coinbase, CashApp, Bells, Send, Plus, Re:verse` |
| Sublogo | boolean | Bank badge in the corner |

`Sublogo` set: `Type=Re:verse, Revolut, Coinbase, Cash App, ETH, TRX, Pocket`.

## Rules
- Size is 48 inside Cell. Don't resize avatars in rows.
- One photo per name across the whole flow.
- The re:verse sublogo only marks re:verse accounts and people who use re:verse.
- Never use the re:verse logo as a generic hint icon; hints use `SF / *` icons by meaning (calendar = date, sparkles = help, clock = reminders, chart.line.uptrend = pace).
